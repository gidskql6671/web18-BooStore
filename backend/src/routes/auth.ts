import * as express from 'express';
import * as passport from 'passport';
import { createUser, isExistsUser } from '../service/user';

const router = express.Router();

const validateId = (id) => {
	const regex = /^[a-zA-Z0-9]{4,13}$/;
	return regex.test(id);
}
const validatePassword = (password) => {
	const regex = /^[a-zA-Z0-9!@#$%^&*]{4,13}$/;
	return regex.test(password);
}

router.post('/signup', async (req, res) => {
	const { id, password } = req.body;
	
	if (!(validateId(id) && validatePassword(password))) {
		return res.status(400).send();
	}
	if (isExistsUser({ loginId: id })) {
		return res.status(409).send();
	}
	
	try {
		const user = await createUser({loginId: id, password});
		
		return res.status(200).send();
	}
	catch(err) {
		return res.status(500).send(err);
	}
});

router.post('/login', passport.authenticate('local-login'), (req, res) => {
	res.json(req.user);
});

export default router;