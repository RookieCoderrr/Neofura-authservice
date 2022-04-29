export default {
    db: {
        user: 'magneter',
        pass: 'neo3magneter',
        host: 'magnetdb',
        port: '27017',
        database: 'testdb',
        authSource: null,
    },
    host: {
        url: '<server-url>',
        port: '3000',
    },
    jwt: {
        secretOrKey: 'secret',
        expiresIn: 10800,
    },
    mail: {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        user: '787136296@qq.com',
        pass: 'jjnfvhqwgeivbcdf',
        sender: '<norelpy@neofura.com>',
    },
};
