import { IUser } from "../../interface/user.interface";

export type AuthContextProps = {
	user: IUser | null;
	setUser: (user: IUser | null) => void;
};
