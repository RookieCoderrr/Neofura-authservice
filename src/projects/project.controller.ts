import {Body, Controller, HttpException, HttpStatus, Param, Patch, UseGuards, UseInterceptors} from '@nestjs/common';
import {FrozeGuard} from '../common/guards/froze.guard';
import {RolesGuard} from '../common/guards/roles.guard';
import {ApiBody, ApiOperation, ApiParam} from '@nestjs/swagger';
import {Roles} from '../common/decorators/roles.decorator';
import {IResponse} from '../common/interfaces/response.interface';
import {CreateProjectDto} from './dto/create-project.dto';
import {ResponseError, ResponseSuccess} from '../common/dto/response.dto';
import {AuthGuard} from '@nestjs/passport';
import {LoggingInterceptor} from '../common/interceptors/logging.interceptor';
import {User} from '../users/interfaces/user.interface';
import {ProjectService} from './project.service';
import {ProjectDto} from './dto/project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';
import {SetLimitperdayDto} from './dto/set-limitperday.dto';
import {DeleteProjectDt} from './dto/delete-project.dto';
import {ProjectoriginDto} from './dto/projectorigin.dto';

@Controller('project')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor)
export class ProjectController {

    constructor(private readonly projectService: ProjectService) {}

    @Patch('create')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '创建一个项目'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                email: '787136296@qq.com',
                name: 'projects J',
                introduction: 'a defi application',
            },
        },
    })
    async createProject(@Body() createProjectDto: CreateProjectDto): Promise<IResponse> {
        try {
            const newProject = new ProjectDto(await this.projectService.createProject(createProjectDto));
            if (newProject) {
                return new ResponseSuccess('CREATE.PROJECT.SUCCESS');
            } else {
                return new ResponseError('CREATE.PROJECT.ERROR');
            }
        } catch (error) {
            return new ResponseError('REGISTRATION.ERROR.GENERIC_ERROR', error);
        }
    }

    @Patch('delete')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '删除一个项目'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                apikey: 'vnQiyDzZKufyyrQw',
                email: '787136296@qq.com',
            },
        },
    })
    async deleteProject(@Body() deletProjectDto: DeleteProjectDt): Promise<IResponse> {
        try {
            const updated = await this.projectService.deleteProject(deletProjectDto);
            return new ResponseSuccess('DELETE.PROJECT.SUCCESS', updated);
        } catch (error) {
            return new ResponseError('DELETE.PROJECT.ERROR', error);
        }
    }

    @Patch('list')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '列出所有项目'})
    @Roles('User')
    @ApiParam({ name: 'email' })
    async listProjects(@Param() params): Promise<IResponse> {
        try {
            const projects = await this.projectService.listProjects(params.email);
            return new ResponseSuccess('PROFILE.LIST_SUCCESS', projects);
        } catch (error) {
            return new ResponseError('PROFILE.LIST_ERROR', error);
        }
    }

    @Patch('rpcRecords')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '列出该项目访问的所有RPC方法'})
    @Roles('User')
    @ApiParam({ name: 'email' })
    async listRpcrecords(@Param() params): Promise<IResponse> {
        try {
            const rpcrecords = await this.projectService.listRpcrecords(params.apikey);
            return new ResponseSuccess('RPCRECORD.LIST_SUCCESS', rpcrecords);
        } catch (error) {
            return new ResponseError('RPCRECORD.LIST_ERROR', error);
        }
    }

    @Patch('update')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '更新一个项目'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                apikey: 'vnQiyDzZKufyyrQw',
                email: '787136296@qq.com',
                name: 'projects X',
                introduction: 'a defi application',
            },
        },
    })
    async updateProject(@Body() updateProjectDto: UpdateProjectDto): Promise<IResponse> {
        try {
            const updated = await this.projectService.updateProject(updateProjectDto);
            return new ResponseSuccess('UPDATE.PROJECT.SUCCESS', updated);
        } catch (error) {
            return new ResponseError('UPDATE.PROJECT.ERROR', error);
        }
    }

    @Patch('limitPerday')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '设置项目每天访问次数'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                apikey: 'vnQiyDzZKufyyrQw',
                limitperday: '1000',
            },
        },
    })
    async setProjectLimitPerday(@Body() setLimitperdayDto: SetLimitperdayDto): Promise<IResponse> {
        try {
            const updated = await this.projectService.setProjectLimitPerday(setLimitperdayDto);
            return new ResponseSuccess('SETLIMITPERDAY.PROJECT.SUCCESS', updated);
        } catch (error) {
            return new ResponseError('SETLIMITPERDAY.PROJECT.ERROR', error);
        }
    }

    @Patch('projectOrigin')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '设置项目允许访问的域名'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                apikey: 'vnQiyDzZKufyyrQw',
                origin: 'localhost',
            },
        },
    })
    async setProjectOrigin(@Body() projectOrigin: ProjectoriginDto ): Promise<IResponse> {
        try {
            const updated = await this.projectService.setOrigin(projectOrigin);
            return new ResponseSuccess('SETORIGIN.PROJECT.SUCCESS', updated);
        } catch (error) {
            return new ResponseError('SETORIGIN.PROJECT.ERROR', error);
        }
    }

    @Patch('dprojectOrigin')
    @UseGuards(FrozeGuard)
    @UseGuards(RolesGuard)
    @ApiOperation({description: '删除项目允许访问的域名'})
    @Roles('User')
    @ApiBody({
        schema: {
            example: {
                apikey: 'vnQiyDzZKufyyrQw',
                origin: 'localhost',
            },
        },
    })
    async delteProjectOrigin(@Body() projectOrigin: ProjectoriginDto ): Promise<IResponse> {
        try {
            const updated = await this.projectService.deleteOrigin(projectOrigin);
            return new ResponseSuccess('DELETEORIGIN.PROJECT.SUCCESS', updated);
        } catch (error) {
            return new ResponseError('FELTEORIGIN.PROJECT.ERROR', error);
        }
    }
}
