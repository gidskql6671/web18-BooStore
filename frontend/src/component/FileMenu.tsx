import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';
import { Capacity } from '../model';
import ModalComponent from './ModalComponent';
import ProgressBar from './ProgressBar';

interface Props {
	showShareButton?: boolean;
	capacity: Capacity;
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
}

const FileMenu: React.FC<Props> = ({ showShareButton, capacity, setCapacity }) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [failureModalText, setFailureModalText] = useState('유효하지 않은 파일입니다.');
	const [toggleFailureModal, setToggleFailureModal] = useState(false);
	const [isCompleteSend, setIsCompleteSend] = useState(true);
	const [toggleProgressModal, setToggleProgressModal] = useState(false);
	const [processedFileSize, setProcessedFileSize] = useState(0);
	const [totalFileSize, setTotalFileSize] = useState(0);
	const [progressModalText, setProgressModalText] = useState('Loading...');
	const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
	const [toggleUploadDropBox, setToggleUploadDropBox] = useState(false);
	
	const onClickActButton = () => {
		setToggleUploadDropBox((prev) => !prev);
	};

	const onclickFileUploadButton = () => {
		inputFileRef.current?.removeAttribute('webkitdirectory');
		
		inputFileRef.current?.click();
	}
	const onclickFolderUploadButton = () => {
		inputFileRef.current?.setAttribute('webkitdirectory', '');
		
		inputFileRef.current?.click();
	}
	
	const onChangeFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFile(event.target.files ? event.target.files : null);
	};

	useEffect(() => {
		if (selectedFile === null || selectedFile.length === 0) {
			return;
		}

		handleFileUpload();
		setSelectedFile(null);
	}, [selectedFile]);

	const validateSize = async (totalSize: number) => {
		const { currentCapacity, maxCapacity } = capacity;
		if (currentCapacity + totalSize > maxCapacity) {
			return false;
		}

		const res = await fetch(`/cloud/validate?size=${totalSize}`, {
			credentials: 'include',
		});

		return res.ok;
	};

	const sendFiles = async (selectedFiles: File[], totalSize: number) => {
		const formData = new FormData();

		formData.append('rootDirectory', '/'); // 추후에는 클라우드상의 현재 디렉토리를 인자로 넣어준다.
		let metaData: any = {};
		let sectionSize = 0;
		let processedSize = 0;
		for (const file of selectedFiles) {
			const { size, name } = file;
			processedSize += size;
			sectionSize += size;

			setProgressModalText(name);
			setProcessedFileSize((prev) => prev + size);
			formData.append('uploadFiles', file, name);
			metaData[file.name] = file.webkitRelativePath;

			// 1MB 단위로 보냄
			if (sectionSize >= 1024 * 1024 || processedSize == totalSize) {
				formData.append('relativePath', JSON.stringify(metaData));

				const res = await fetch(`/cloud/upload`, {
					method: 'POST',
					credentials: 'include',
					body: formData,
				});
				if (!res.ok) {
					throw new Error(res.status.toString());
				}

				formData.delete('uploadFiles');
				formData.delete('relativePath');
				metaData = {};
				sectionSize = 0;
			}
		}
	};

	const handleFileUpload = async () => {
		const selectedFiles = [...(selectedFile as FileList)];
		const totalSize = selectedFiles.reduce((prev, file) => prev + file.size, 0);

		try {
			if (!(await validateSize(totalSize))) {
				throw new Error('용량 초과');
			}
			setTotalFileSize(totalSize);
			setProcessedFileSize(0);
			setProgressModalText('Loading...');
			setIsCompleteSend(false);
			setToggleProgressModal(true);

			await sendFiles(selectedFiles, totalSize);

			setProgressModalText('Complete!');
			setIsCompleteSend(true);
		} catch (err) {
			setFailureModalText((err as Error).message);
			setToggleFailureModal(true);
		}

		inputFileRef.current!.value = '';
	};

	return (
		<Container>
			<SelectAllBtn>
				<ToggleOffSvg />
			</SelectAllBtn>
			<ActBox>
				<ActButton onClick={onClickActButton}>올리기</ActButton>
				{!toggleUploadDropBox || <DropBox>
					<DropBoxButton onClick={onclickFileUploadButton}> 파일로 업로드 </DropBoxButton>
					<hr/>
					<DropBoxButton onClick={onclickFolderUploadButton}> 폴더로 업로드 </DropBoxButton>
					</DropBox>}
			</ActBox>
			<UploadInput
				multiple
				type="file"
				name="uploadFiles"
				ref={inputFileRef}
				onChange={onChangeFileInput}
			/>
			<FailureModal isOpen={toggleFailureModal} setToggleModal={setToggleFailureModal}>
				<p>{failureModalText}</p>
			</FailureModal>
			<ProgressModal
				isOpen={toggleProgressModal}
				onCloseButton={isCompleteSend}
				setToggleModal={setToggleProgressModal}
			>
				<div>
					<p> {progressModalText} </p>
					<ProgressBar value={processedFileSize} maxValue={totalFileSize} />
				</div>
			</ProgressModal>
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

const ActBox = styled.div`
	position: relative;
`;
const ActButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
	height: 100%;
`;
const DropBox = styled.div`
	position: absolute;
	margin-top: 10px;
	
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
	padding: 10px;
`;
const DropBoxButton = styled.button`
	outline: none;
	cursor: pointer;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	border: none;
	width: 100%;
	text-align: center;
	font-size: 14px;
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

const FailureModal = styled(ModalComponent)``;
const ProgressModal = styled(ModalComponent)``;

export default React.memo(FileMenu);
