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
            createdProject.request = 0;
            createdProject.secretrequired = false;
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
        const projects = await this.projectModel.find(email);
        if (!projects) {
            throw new HttpException('COMMON.PROJECT_NOT_FIND', HttpStatus.NOT_FOUND);
        }
        return projects;
    }

    async listRpcrecords(apikey: string): Promise <Rpcrecord[]> {
         const rpcrecords = await this.rpcrecordModel.find(apikey).exec();
         if (!rpcrecords) {
            throw new HttpException('COMMON.PROJECTRPCRECORD_NOT_FIND', HttpStatus.NOT_FOUND);
         }
         return rpcrecords;
    }

    async enableProjectSecret(enableProjectSecretDto: EnableProjectSecretDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: enableProjectSecretDto.apikey});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (enableProjectSecretDto.enable) projectFromDb.secretrequired = enableProjectSecretDto.enable;
        return await projectFromDb.save();
    }

    async setProjectLimitPerday(setLimitperday: SetLimitperdayDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: setLimitperday.apikey});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (setLimitperday.limitperday) projectFromDb.limitperday = setLimitperday.limitperday;
        // tslint:disable-next-line:no-console
        return await projectFromDb.save();
    }
    async setOrigin(projectOrigin: ProjectoriginDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: projectOrigin.apikey});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (projectOrigin.origin) {
            if (projectFromDb.origin.indexOf(projectOrigin.origin) !== -1) {
                throw new HttpException('PROJECT_HOST_ALREADY_EXISTED', HttpStatus.NOT_FOUND);
            }
            projectFromDb.origin.push(projectOrigin.origin);
        }
        return await projectFromDb.save();
    }
    async deleteOrigin(projectOrigin: ProjectoriginDto): Promise <Project> {
        const projectFromDb = await this.projectModel.findOne({apikey: projectOrigin.apikey});
        if (!projectFromDb) { throw new HttpException('COMMON.PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND); }
        if (projectOrigin.origin) {
            const index = projectFromDb.origin.indexOf(projectOrigin.origin, 0);
            if (index > -1) {
                projectFromDb.origin.splice(index, 1);
            } else {
                throw new HttpException('PROJECT_HOST_NO_EXISTED', HttpStatus.NOT_FOUND);
            }
        }
        return await projectFromDb.save();
    }
}
