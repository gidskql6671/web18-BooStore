import * as express from 'express';
import { ResponseUser } from '../DTO';
import {
	getCapacity,
	getFiles,
	getFilteredFiles,
	FilesArg,
	FilteredFilesArg,
	getDirectoryList,
} from '../service/cloud';
import { isAuthenticated } from '../middleware';
import { applyEscapeString } from '../util';

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
	const { loginId } = req.user;

	const data: ResponseUser = { loginId };

	return res.json(data);
});

router.get('/capacity', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const data = await getCapacity({ loginId });

	return res.json(data);
});

router.get('/files', isAuthenticated, async (req, res) => {
	const { path, isAscending, isDeleted } = req.query;
	const { loginId } = req.user;
	if (path === undefined) {
		return res.status(400).send();
	}
	if (path === '') {
		return res.status(400).send();
	}

	const filesArg: FilesArg = {
		loginId: loginId,
		regex: `(^${applyEscapeString(path as string)}$)|(^${
			path === '/' ? '' : applyEscapeString(path as string)
		}/(.*)?$)`,
		isAscending: isAscending === 'true',
		isDeleted: isDeleted === 'true',
	};

	const tempFiles = await getFiles(filesArg);

	const filteredFilesArg: FilteredFilesArg = {
		path: path as string,
		originFiles: tempFiles,
	};

	const files = getFilteredFiles(filteredFilesArg);
	return res.status(200).json(files);
});

router.get('/directory', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const directoryList = await getDirectoryList(loginId);
	return res.json(directoryList);
});

export default router;
