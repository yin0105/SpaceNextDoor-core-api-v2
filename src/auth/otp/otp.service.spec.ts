import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import dayJS from 'dayjs';
import { Sequelize } from 'sequelize';

import {
  OTP_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { OTP } from './otp.model';
import { OTPService } from './otp.services';

describe('SiteService', () => {
  let service: OTPService;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        OTPService,
        {
          provide: OTP_REPOSITORY,
          useValue: OTP,
        },
        {
          provide: SEQUELIZE_PROVIDER,
          useValue: {
            transaction: jest.fn(() => ({
              commit: jest.fn(),
              rollback: jest.fn(),
            })),
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<OTPService>(OTPService);
    sequelize = module.get<Sequelize>(SEQUELIZE_PROVIDER);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete OTP', () => {
    it('should delete OTP', async () => {
      const spy = jest.spyOn(OTP, 'destroy').mockResolvedValue(1);
      const result = await service.delete('+66643369454');

      expect(result).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });

    it('should return false if OTP is not deleted', async () => {
      const spy = jest.spyOn(OTP, 'destroy').mockResolvedValue(0);
      const result = await service.delete('+66643369454');

      expect(result).toBeFalsy();
      expect(spy).toHaveBeenCalled();
    });

    it('should throw error if db fails', async () => {
      jest.spyOn(OTP, 'destroy').mockRejectedValue('err');

      const result = await service.delete('+66643369454').catch((e) => {
        expect(e).toEqual('err');
      });

      expect(result).toBeUndefined();
    });
  });

  describe('verify OTP', () => {
    it('should verify OTP with success', async () => {
      const modelSpy = jest.spyOn(OTP, 'findOne').mockResolvedValue({
        otp_hash: '',
        expires_at: dayJS().add(1, 'm').toISOString(),
      } as any);
      const bcryptSpy = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service.isCorrect('+66643369454', '123456');

      expect(result).toBeTruthy();
      expect(modelSpy).toHaveBeenCalled();
      expect(bcryptSpy).toHaveBeenCalled();
    });

    it('should return false if OTP hash comparison fails', async () => {
      const modelSpy = jest.spyOn(OTP, 'findOne').mockResolvedValue({
        otp_hash: '',
        expires_at: dayJS().add(1, 'm').toISOString(),
      } as any);
      const bcryptSpy = jest
        .spyOn(bcrypt, 'compareSync')
        .mockReturnValue(false);
      const result = await service.isCorrect('+66643369454', '123456');

      expect(result).toBeFalsy();
      expect(modelSpy).toHaveBeenCalled();
      expect(bcryptSpy).toHaveBeenCalled();
    });

    it('should return false if OTP expires', async () => {
      const modelSpy = jest.spyOn(OTP, 'findOne').mockResolvedValue({
        otp_hash: '',
        expires_at: dayJS().subtract(1, 'm').toISOString(),
      } as any);
      const bcryptSpy = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service.isCorrect('+66643369454', '123456');

      expect(result).toBeFalsy();
      expect(modelSpy).toHaveBeenCalled();
      expect(bcryptSpy).toHaveBeenCalled();
    });

    it('should return false if no OTP found with username', async () => {
      const modelSpy = jest
        .spyOn(OTP, 'findOne')
        .mockResolvedValue(null as any);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service.isCorrect('+66643369454', '123456');

      expect(result).toBeFalsy();
      expect(modelSpy).toHaveBeenCalled();
    });

    it('should throw error if db fails', async () => {
      const modelSpy = jest
        .spyOn(OTP, 'findOne')
        .mockRejectedValue('err' as any);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service
        .isCorrect('+66643369454', '123456')
        .catch((e) => {
          expect(e).toEqual('err');
        });

      expect(result).toBeUndefined();
      expect(modelSpy).toHaveBeenCalled();
    });
  });

  describe('send OTP', () => {
    it('should send OTP with success', async () => {
      const t = { commit: jest.fn() };
      const txSpy = jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValue(t as any);
      const modelSpy = jest
        .spyOn(OTP, 'create')
        .mockResolvedValue('err' as any);
      const hashSpy = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash');
      jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue(10);
      const channel = { send: jest.fn() };

      const result = await service.send(channel, '+66643369454');

      expect(result).toBeTruthy();
      expect(modelSpy).toHaveBeenCalled();
      expect(channel.send).toHaveBeenCalled();
      expect(hashSpy).toHaveBeenCalled();
      expect(txSpy).toHaveBeenCalled();
      expect(t.commit).toHaveBeenCalled();
    });

    it('should rollback tx if channel failed to send OTP', async () => {
      const t = { rollback: jest.fn() };
      const txSpy = jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValue(t as any);
      const modelSpy = jest
        .spyOn(OTP, 'create')
        .mockResolvedValue('test' as any);
      const hashSpy = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash');
      jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue(10);
      const channel = { send: jest.fn().mockRejectedValue(new Error('err')) };

      const result = await service.send(channel, '+66643369454').catch((e) => {
        expect(e.message).toEqual('err');
      });

      expect(result).toBeUndefined();
      expect(modelSpy).toHaveBeenCalled();
      expect(channel.send).toHaveBeenCalled();
      expect(hashSpy).toHaveBeenCalled();
      expect(txSpy).toHaveBeenCalled();
      expect(t.rollback).toHaveBeenCalled();
    });

    it('should throw error if db failed', async () => {
      const t = { rollback: jest.fn() };
      const txSpy = jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValue(t as any);
      const modelSpy = jest
        .spyOn(OTP, 'create')
        .mockRejectedValue(new Error('err') as any);
      const hashSpy = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash');
      jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue(10);
      const channel = { send: jest.fn().mockRejectedValue(new Error('err')) };

      const result = await service.send(channel, '+66643369454').catch((e) => {
        expect(e.message).toEqual('err');
      });

      expect(result).toBeUndefined();
      expect(modelSpy).toHaveBeenCalled();
      expect(hashSpy).toHaveBeenCalled();
      expect(txSpy).toHaveBeenCalled();
      expect(t.rollback).toHaveBeenCalled();
    });
  });
});
