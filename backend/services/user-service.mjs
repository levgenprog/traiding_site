import userModel from "../models/user-model.mjs";
import mailService from "./mail-service.mjs";
import tokenService from "./token-service.mjs";
import UserDto from "../dtos/user-dto.mjs";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import ApiError from "../exceptions/api-errors.mjs";

class UserService {
    async registration(email, password) {
        const candidate = await userModel.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest(`User ${email} already exists`);
        }
        const hashedPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid();
        const user = await userModel.create({ email, password: hashedPassword, activationLink });
        await mailService.sendActivation(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        };
    }

    async activate(activationLink){
        const user = await userModel.findOne({activationLink});
        if(!user){
            throw ApiError.BadRequest("There is no such a user");
        }

        user.isActivated = true;
        await user.save();
    }

    async loginUser(email, password){
        const candidate = await userModel.findOne({email});
        if(!candidate){
            throw ApiError.BadRequest(`User ${email} is not registrered`);
        }
        const isPassword = await bcrypt.compare(password, candidate.password);
        if(!isPassword){
            throw ApiError.BadRequest('Incorrect password');
        }
        const userDto = new UserDto(candidate);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        };
    }

    async logoutUser(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDB){
            throw ApiError.UnauthorizedError();
        }
        const user = await userModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        };
    }

    async getUsers(){
        const users = userModel.find();
        return users;
    }
}

export default new UserService();
