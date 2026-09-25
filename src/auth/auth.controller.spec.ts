import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

// Le controleur transmet les DTO et les reponses ; le service est teste a part.
// Source : https://docs.nestjs.com/fundamentals/testing
describe('AuthController', () => {
  let module: TestingModule;
  let controller: AuthController;
  const auth = { register: vi.fn(), login: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth }],
    }).compile();
    controller = module.get(AuthController);
  });

  afterEach(async () => {
    await module?.close();
  });

  it('transmet les donnees et retourne le token a inscription', async () => {
    const dto = {
      username: 'test',
      email: 'jwt@example.com',
      password: 'Test!',
    };
    const result = { access_token: 'token-de-test' };
    auth.register.mockResolvedValue(result);
    await expect(controller.register(dto)).resolves.toEqual(result);
    expect(auth.register).toHaveBeenCalledWith(dto);
  });

  it('transmet les donnees et retourne le token a connexion', async () => {
    const dto = { email: 'jwt@example.com', password: 'Test!' };
    const result = { access_token: 'token-de-test' };
    auth.login.mockResolvedValue(result);
    await expect(controller.login(dto)).resolves.toEqual(result);
    expect(auth.login).toHaveBeenCalledWith(dto);
  });

  it('propage le refus des identifiants', async () => {
    auth.login.mockRejectedValue(new UnauthorizedException());
    await expect(
      controller.login({ email: 'jwt@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
