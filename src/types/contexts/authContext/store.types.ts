import { IUser } from "../../interface/user.interface";

export type Store = {
	user: IUser | null;
	isLoggedIn: boolean;
};
