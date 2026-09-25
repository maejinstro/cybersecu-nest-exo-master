import { Module, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AuthModule } from './auth.module.js';
import { AuthService } from './auth.service.js';
import { UserModule } from '../user/user.module.js';
import { UserService } from '../user/user.service.js';

// Vrai module JWT, mais sans PostgreSQL ni lecture des secrets locaux.
// Source : https://docs.nestjs.com/fundamentals/testing
const users = { create: vi.fn(), findByEmail: vi.fn() };
@Module({
  providers: [{ provide: UserService, useValue: users }],
  exports: [UserService],
})
class TestUserModule {}

describe('AuthService avec le module JWT', () => {
  let module: TestingModule;
  let service: AuthService;
  let jwt: JwtService;
  const credentials = { email: 'jwt@example.com', password: 'TestPassword!' };
  const user = { id: 42, username: 'test', role: 'user', ...credentials };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          skipProcessEnv: true,
          load: [
            () => ({ JWT_SECRET: 'secret-reserve-aux-tests-automatises' }),
          ],
        }),
        AuthModule,
      ],
    })
      .overrideModule(UserModule)
      .useModule(TestUserModule)
      .compile();
    service = module.get(AuthService);
    jwt = module.get(JwtService);
  });

  afterEach(async () => {
    await module?.close();
  });

  // Controle la signature, l'absence de donnees sensibles et la duree.
  function checkToken(result: { access_token: string }, role = 'user') {
    expect(Object.keys(result)).toEqual(['access_token']);
    const payload = jwt.verify(result.access_token, { algorithms: ['HS256'] });
    expect(payload).toEqual({
      sub: 42,
      role,
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
    expect(payload.exp - payload.iat).toBe(900);
    return payload;
  }

  it('emet un token apres inscription', async () => {
    users.create.mockResolvedValue(user);
    const dto = { username: 'test', ...credentials };
    checkToken(await service.register(dto));
    expect(users.create).toHaveBeenCalledWith(dto);
  });

  it('utilise le role enregistre lors de la connexion', async () => {
    users.findByEmail.mockResolvedValue({ ...user, role: 'admin' });
    checkToken(await service.login(credentials), 'admin');
    expect(users.findByEmail).toHaveBeenCalledWith(credentials.email);
  });

  it.each([
    ['email inconnu', null],
    ['mauvais mot de passe', { ...user, password: 'DifferentPassword!' }],
  ])('refuse sans signer de token : %s', async (_label, foundUser) => {
    users.findByEmail.mockResolvedValue(foundUser);
    const sign = vi.spyOn(jwt, 'signAsync');
    await expect(service.login(credentials)).rejects.toThrow(
      new UnauthorizedException('Email ou mot de passe incorrect'),
    );
    expect(sign).not.toHaveBeenCalled();
  });

  it("ne signe pas si l'enregistrement echoue", async () => {
    users.create.mockRejectedValue(new Error('Enregistrement impossible'));
    const sign = vi.spyOn(jwt, 'signAsync');
    await expect(
      service.register({ username: 'test', ...credentials }),
    ).rejects.toThrow('Enregistrement impossible');
    expect(sign).not.toHaveBeenCalled();
  });

  it('refuse le token expire ou verifie avec un autre secret', async () => {
    users.findByEmail.mockResolvedValue(user);
    const result = await service.login(credentials);
    const payload = checkToken(result);
    // Simule l'expiration sans attendre quinze minutes.
    expect(() =>
      jwt.verify(result.access_token, {
        algorithms: ['HS256'],
        clockTimestamp: payload.exp,
      }),
    ).toThrow('jwt expired');
    expect(() =>
      jwt.verify(result.access_token, {
        algorithms: ['HS256'],
        secret: 'autre-secret-de-test',
      }),
    ).toThrow('invalid signature');
  });
});
