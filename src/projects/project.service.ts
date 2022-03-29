import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {User} from '../users/interfaces/user.interface';
import {Project} from './interfaces/project.interface';
import {CreateProjectDto} from './dto/create-project.dto';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Schema} from 'mongoose';
import {UpdateProjectDto} from './dto/update-project.dto';
import * as http from 'http';
import {Rpcrecord} from './interfaces/rpcrecord.interface';
import {exec} from 'child_process';
import {Md5} from 'ts-md5/dist/md5';
import {SetLimitperdayDto} from './dto/set-limitperday.dto';
import {DeleteProjectDt} from './dto/delete-project.dto';
import {ProjectoriginDto} from './dto/projectorigin.dto';
import {EnableProjectSecretDto} from './dto/enableProjectSecret.dto';
import {FindByEmailApiKeyDto} from './dto/findByEmail.dto';
import {SetLimitperSecondDto} from './dto/set-limitperSecond.dto';
import {AllowContractDto} from './dto/allowContract.dto';
import {ApiMethodDto} from './dto/apiMethod.dto';
// tslint:disable-next-line:no-var-requires
const stringRandom = require('string-random');

@Injectable()
export class ProjectService {

    // tslint:disable-next-line:max-line-length
    constructor(@InjectModel('User') private readonly userModel: Model<User>, @InjectModel('Project') private readonly projectModel: Model<Project>, @InjectModel('Rpcrecord') private readonly rpcrecordModel: Model<Rpcrecord>) { }

    async findByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email }).exec();
    }
    async findProjectByApikey(apikey: string, email: string): Promise<Project>{
        return await this.projectModel.findOne({apikey, email}).exec();
    }
    async createProject(newProject: CreateProjectDto): Promise<Project> {
        const isExisted = await this.findByEmail(newProject.email);
        if (isExisted) {
            const createdProject = new this.projectModel(newProject);
            createdProject.email = newProject.email;
            createdProject.name = newProject.name;
            createdProject.introduction = newProject.introduction;
            // generate apikey and api secret
            createdProject.apikey = Md5.hashStr(newProject.name + Date.parse(new Date().toString()));
            createdProject.apisecret = Md5.hashStr(newProject.email + newProject.name + Date.parse(new Date().toString()));
            return await createdProject.save();
        } else {
            throw new HttpException('USER_NOT_FOUND', HttpStatus.FORBIDDEN);
        }
    }
    async deleteProject(deleteProject: DeleteProjectDt): Promise<{ ok?: number; n?: number } & { deletedCount?: number }> {
        const isExisted = await this.findByEmail(deleteProject.email);
        if (isExisted) {
            const projectFromDb = this.findProjectByApikey(deleteProject.apikey, deleteProject.email);
            if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
            return  await this.projectModel.deleteOne({apikey: deleteProject.apikey}).exec();
        } else {
            throw new HttpException('USER_NOT_FOUND', HttpStatus.FORBIDDEN);
        }
    }

    async updateProject(updateProject: UpdateProjectDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: updateProject.apikey, email: updateProject.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (updateProject.name) projectFromDb.name = updateProject.name;
        if (updateProject.introduction) projectFromDb.introduction = updateProject.introduction;
        // tslint:disable-next-line:no-console
        console.log(projectFromDb);
        return await projectFromDb.save();
    }

    async listProjects(email: string): Promise <Project[]> {
        const projects = await this.projectModel.find({email}).exec();
        if (!projects) {
            throw new HttpException('COMMON.PROJECT_NOT_FIND', HttpStatus.NOT_FOUND);
        }
        return projects;
    }

    async listProjectByProjectId(findByEmailApiKeyDto: FindByEmailApiKeyDto): Promise <Project> {
        const project = await this.projectModel.findOne({email: findByEmailApiKeyDto.email, apikey : findByEmailApiKeyDto.apikey});
        if (!project) {
            throw new HttpException('COMMON.PROJECT_NOT_FIND', HttpStatus.NOT_FOUND);
        }
        return project;
    }

    async listRpcrecords(apikey: string): Promise <Rpcrecord[]> {
         const rpcrecords = await this.rpcrecordModel.find({apikey}).exec();
         if (!rpcrecords) {
            throw new HttpException('COMMON.PROJECTRPCRECORD_NOT_FIND', HttpStatus.NOT_FOUND);
         }
         return rpcrecords;
    }

    async enableProjectSecret(enableProjectSecretDto: EnableProjectSecretDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: enableProjectSecretDto.apikey, email: enableProjectSecretDto.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        projectFromDb.secretrequired = enableProjectSecretDto.enable;
        return await projectFromDb.save();
    }

    async setProjectLimitPerday(setLimitperday: SetLimitperdayDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: setLimitperday.apikey, email: setLimitperday.email });
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (setLimitperday.limitPerday) projectFromDb.limitperday = setLimitperday.limitPerday;
        // tslint:disable-next-line:no-console
        return await projectFromDb.save();
    }

    async setProjectLimitPerSecond(setLimitperSecondDto: SetLimitperSecondDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: setLimitperSecondDto.apikey, email: setLimitperSecondDto.email });
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (setLimitperSecondDto.limitPerSecond) projectFromDb.limitpersecond = setLimitperSecondDto.limitPerSecond;
        // tslint:disable-next-line:no-console
        return await projectFromDb.save();
    }
    async addApiMethod(apiMethodDto: ApiMethodDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: apiMethodDto.apikey, email: apiMethodDto.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (apiMethodDto.apiMethod) {
            if (projectFromDb.apiRequest.indexOf(apiMethodDto.apiMethod) !== -1) {
                throw new HttpException('PROJECT_APIMETHOD_ALREADY_EXISTED', HttpStatus.NOT_FOUND);
            }
            projectFromDb.apiRequest.push(apiMethodDto.apiMethod);
        }
        return await projectFromDb.save();
    }

    async deleteApiMethod(apiMethodDto: ApiMethodDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: apiMethodDto.apikey});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (apiMethodDto.apiMethod) {
            const index = projectFromDb.apiRequest.indexOf(apiMethodDto.apiMethod, 0);
            if (index > -1) {
                projectFromDb.apiRequest.splice(index, 1);
            } else {
                throw new HttpException('PROJECT_APIMETHOD_NO_EXISTED', HttpStatus.NOT_FOUND);
            }
        }
        return await projectFromDb.save();
    }

    async setOrigin(projectOrigin: ProjectoriginDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: projectOrigin.apikey, email: projectOrigin.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (projectOrigin.origin) {
            if (projectFromDb.origin.indexOf(projectOrigin.origin) !== -1) {
                throw new HttpException('PROJECT_ORIGIN_ALREADY_EXISTED', HttpStatus.NOT_FOUND);
            }
            projectFromDb.origin.push(projectOrigin.origin);
        }
        return await projectFromDb.save();
    }
    async deleteOrigin(projectOrigin: ProjectoriginDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: projectOrigin.apikey , email: projectOrigin.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (projectOrigin.origin) {
            const index = projectFromDb.origin.indexOf(projectOrigin.origin, 0);
            if (index > -1) {
                projectFromDb.origin.splice(index, 1);
            } else {
                throw new HttpException('PROJECT_ORIGIN_NO_EXISTED', HttpStatus.NOT_FOUND);
            }
        }
        return await projectFromDb.save();
    }

    async addContract(allowContractDto: AllowContractDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: allowContractDto.apikey, email: allowContractDto.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (allowContractDto.contract) {
            if (projectFromDb.contractAddress.indexOf(allowContractDto.contract) !== -1) {
                throw new HttpException('PROJECT_ALLOWCONTRACT_ALREADY_EXISTED', HttpStatus.NOT_FOUND);
            }
            projectFromDb.contractAddress.push(allowContractDto.contract);
        }
        return await projectFromDb.save();
    }

    async deleteContract(allowContractDto: AllowContractDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: allowContractDto.apikey, email: allowContractDto.email});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (allowContractDto.contract) {
            const index = projectFromDb.contractAddress.indexOf(allowContractDto.contract, 0);
            if (index > -1) {
                projectFromDb.contractAddress.splice(index, 1);
            } else {
                throw new HttpException('PROJECT_ALLOWCONTRACT_NO_EXISTED', HttpStatus.NOT_FOUND);
            }
        }
        return await projectFromDb.save();
    }
}
