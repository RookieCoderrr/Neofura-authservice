import * as bcrypt from 'bcryptjs';
import { Injectable, HttpException, HttpStatus, HttpService } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { Model } from 'mongoose';
import { User } from '../users/interfaces/user.interface';
import { UserDto } from '../users/dto/user.dto';
import { EmailVerification } from './interfaces/emailverification.interface';
import { ForgottenPassword } from './interfaces/forgottenpassword.interface';
import { ConsentRegistry } from './interfaces/consentregistry.interface';
import { InjectModel } from '@nestjs/mongoose';
import config from '../config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import mjml2html = require('mjml');
import handlebars from 'handlebars';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>,
              @InjectModel('EmailVerification') private readonly emailVerificationModel: Model<EmailVerification>,
              @InjectModel('ForgottenPassword') private readonly forgottenPasswordModel: Model<ForgottenPassword>,
              @InjectModel('ConsentRegistry') private readonly consentRegistryModel: Model<ConsentRegistry>,
              private readonly jwtService: JWTService) { }

  async validateLogin(email, password) {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const isValidPass = await bcrypt.compare(password, userFromDb.password);
    if (isValidPass) {
      if (!userFromDb.auth) throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
      const accessToken = await this.jwtService.createToken(email, userFromDb.role);
      return { token: accessToken, user: new UserDto(userFromDb) };
    } else {
      throw new HttpException('LOGIN.PASSWORD_NOT_VALID', HttpStatus.UNAUTHORIZED);
    }
  }

  async validateAdminLogin(email, password) {
    const userFromDb = await this.userModel.findOne({ email });
    if (userFromDb.role !== 'Admin') throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const isValidPass = await bcrypt.compare(password, userFromDb.password);
    if (isValidPass) {
      if (!userFromDb.auth) throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
      const accessToken = await this.jwtService.createToken(email, userFromDb.role);
      return { token: accessToken, user: new UserDto(userFromDb) };
    } else {
      throw new HttpException('LOGIN.PASSWORD_NOT_VALID', HttpStatus.UNAUTHORIZED);
    }
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({ email });
    if (emailVerification && ((new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 < 1)) {
      throw new HttpException('LOGIN.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const emailVerificationModel = await this.emailVerificationModel.findOneAndUpdate(
        { email },
        {
          email,
          emailToken: Math.floor(Math.random() * (900000)) + 100000,
          timestamp: new Date(),
        },
        { upsert: true },
      );
      return true;
    }
  }

  async saveUserConsent(email: string): Promise<ConsentRegistry> {
    try {
      const http = new HttpService();

      const newConsent = new this.consentRegistryModel();
      newConsent.email = email;
      newConsent.date = new Date();
      newConsent.registrationForm = ['name', 'surname', 'email', 'birthday date', 'password'];
      newConsent.checkboxText = 'I accept privacy policy';
      const privacyPolicyResponse: any = await http.get('https://www.XXXXXX.com/api/privacy-policy').toPromise();
      newConsent.privacyPolicy = privacyPolicyResponse.data.content;
      const cookiePolicyResponse: any = await http.get('https://www.XXXXXX.com/api/privacy-policy').toPromise();
      newConsent.cookiePolicy = cookiePolicyResponse.data.content;
      newConsent.acceptedPolicy = 'Y';
      return await newConsent.save();
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error(error);
    }
  }

  async createForgottenPasswordToken(email: string): Promise<ForgottenPassword> {
    const forgottenPassword = await this.forgottenPasswordModel.findOne({ email });
    if (forgottenPassword && ((new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 < 15)) {
      throw new HttpException('RESET_PASSWORD.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const forgottenPasswordModel = await this.forgottenPasswordModel.findOneAndUpdate(
        { email },
        {
          email,
          newPasswordToken: Math.floor(Math.random() * (900000)) + 100000,
          timestamp: new Date(),
        },
        { upsert: true, new: true },
      );
      if (forgottenPasswordModel) {
        return forgottenPasswordModel;
      } else {
        throw new HttpException('LOGIN.ERROR.GENERIC_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async verifyLoginEmail(token: string): Promise<boolean> {
    const emailVerif = await this.emailVerificationModel.findOne({ emailToken: token });
    if (emailVerif && emailVerif.email) {
      const userFromDb = await this.userModel.findOne({ email: emailVerif.email });
      if (userFromDb) {
        userFromDb.auth = true;
        const savedUser = await userFromDb.save();
        await emailVerif.remove();
        return !!savedUser;
      }
    } else {
      throw new HttpException('LOGIN.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
    }
  }
  async verifyForgotPasswordEmail(token: string): Promise<boolean> {
    const emailVerif = await this.forgottenPasswordModel.findOne({ newPasswordToken: token });
    if (emailVerif && emailVerif.email) {
      const userFromDb = await this.userModel.findOne({ email: emailVerif.email });
      if (userFromDb) {
        await emailVerif.remove();
        return !!emailVerif;
      }
    } else {
      throw new HttpException('FORGOTPASSWORD.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
    }
  }

  async getForgottenPasswordModel(newPasswordToken: string): Promise<ForgottenPassword> {
    return this.forgottenPasswordModel.findOne({newPasswordToken});
  }

  async sendVerifyEmail(emailAddress: string, func: string, emailToken: string): Promise<boolean> {
    const template = handlebars.compile(fs.readFileSync('src/auth/emailTemplate/email.mjml', 'utf8'));
    const vars = {email : emailToken};
    const html1 = mjml2html(template(vars)).html;
    const transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
    let emailValue;
    if (func === 'register') {
      // tslint:disable-next-line:max-line-length
      emailValue = 'You have signed up for the Neofura. Please confirm your email address to continue setup. If you received this by mistake or were not expecting, please disregard this email. click http://127.0.0.1:3000/auth/email/verifyLogin/' + emailToken ;
    } else if (func === 'forgottenPassword') {
      // tslint:disable-next-line:max-line-length
      emailValue = '[neofura]You are changing your password, please click http://127.0.0.1:3000/auth/email/verifyForgotPassword/' + emailToken + ' ,don\'t tell this token to anybody!';
    }
    const mailOptions = {
      from: config.mail.user, // sender address
      to: emailAddress, // list of receivers
      subject: 'NeoFura Service', // Subject line
      // 发送text或者html格式
      // text: 'Hello world?', // plain text body
      html: html1,
    };
    const res = await transporter.sendMail(mailOptions);
    return res;
  }
  async sendForgotPassEmail(emailAddress: string, func: string, emailToken: string): Promise<boolean> {
    const template = handlebars.compile(fs.readFileSync('src/auth/emailTemplate/password.mjml', 'utf8'));
    const vars = {email : emailToken};
    const html1 = mjml2html(template(vars)).html;
    const transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
    let emailValue;
    if (func === 'register') {
      // tslint:disable-next-line:max-line-length
      emailValue = 'You have signed up for the Neofura. Please confirm your email address to continue setup. If you received this by mistake or were not expecting, please disregard this email. click http://127.0.0.1:3000/auth/email/verifyLogin/' + emailToken ;
    } else if (func === 'forgottenPassword') {
      // tslint:disable-next-line:max-line-length
      emailValue = '[neofura]You are changing your password, please click http://127.0.0.1:3000/auth/email/verifyForgotPassword/' + emailToken + ' ,don\'t tell this token to anybody!';
    }
    const mailOptions = {
      from: config.mail.user, // sender address
      to: emailAddress, // list of receivers
      subject: 'NeoFura Service', // Subject line
      // 发送text或者html格式
      // text: 'Hello world?', // plain text body
      html: html1,
    };
    const res = await transporter.sendMail(mailOptions);
    return res;
  }
  async sendEmailVerification(email: string, func: string): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email });
    if (model && model.emailToken) {
      return await this.sendVerifyEmail(email, 'register', model.emailToken);
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }

  async checkPassword(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    return await bcrypt.compare(password, userFromDb.password);
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      return await this.sendForgotPassEmail(email, 'forgottenPassword', tokenModel.newPasswordToken);
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }
}
