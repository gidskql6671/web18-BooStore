export {};

interface UserModel {
	_id: string;
	loginId: string;
	password: string;
	directoryId: string;
	maxCapacity: number;
	currentCapacity: number;
}

declare global {
	namespace Express {
		interface User extends UserModel {}
	}
}