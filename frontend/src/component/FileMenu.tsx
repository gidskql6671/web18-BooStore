import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';

interface Props {
	showShareButton?: boolean;
}

const FileMenu: React.FC<Props> = ({ showShareButton }) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [modalText, setModalText] = useState('올바르지 않은 파일 입니다.');
	const onClickUpload = () => {
		inputFileRef.current?.click();
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.files ? event.target.files : null);
		setSelectedFile(event.target.files ? event.target.files : null);
	};

	useEffect(() => {
		if (selectedFile !== null) {
			handleFileUpload();
		}
	}, [selectedFile]);

	useEffect(() => {
		if (inputFileRef !== null) {
			inputFileRef.current?.setAttribute('directory', '');
			inputFileRef.current?.setAttribute('webkitdirectory', '');
		}
	}, [inputFileRef]);

	const handleFileUpload = () => {
		const formData = new FormData();
		Array.prototype.forEach.call(selectedFile, (file) => {
			formData.append('upload', file, file.name);
		});

		fetch(`/cloud/upload`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: formData,
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error(response.status.toString());
				}
			})
			.catch((err) => {
				console.log(err);
				setModalIsOpen(true);
			});
	};

	return (
		<Container>
			<SelectAllBtn>
				<ToggleOffSvg />
			</SelectAllBtn>
			<ActButton onClick={onClickUpload}>올리기</ActButton>
			<UploadInput
				multiple
				type="file"
				name="singleFile"
				ref={inputFileRef}
				onChange={onChange}
			/>
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={() => setModalIsOpen(false)}
				ariaHideApp={false}
			>
				{modalText}
				<FlexMiddleDiv>
					<ModalButton onClick={() => setModalIsOpen(false)}>Modal Close</ModalButton>
				</FlexMiddleDiv>
			</Modal>
			{!showShareButton || <ShareButton> 공유하기 </ShareButton>}
		</Container>
	);
};

const Container = styled.div`
	padding: 15px 20px;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};

	display: flex;
`;

const SelectAllBtn = styled.button`
	cursor: pointer;

	padding: 0;
	margin-right: 20px;

	display: flex;
	justify-content: center;
	align-items: center;
`;

const ActButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
`;

const ShareButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;

	margin-left: auto;
`;

const UploadInput = styled.input`
	display: none;
`;

const FlexMiddleDiv = styled.div`
	display: flex;
	justify-content: center;

	margin-top: 30px;
`;

Modal.defaultStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.75)',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		position: 'absolute',
		width: '400px',
		height: '200px',
		border: '1px solid #ccc',
		background: '#fff',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		borderRadius: '4px',
		outline: 'none',
		padding: '30px',
	},
};

export const ModalButton = styled.div`
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 6px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font-size: 12px;
	padding: 10px;
`;

export default React.memo(FileMenu);
function userEffect(arg0: () => void) {
	throw new Error('Function not implemented.');
}
