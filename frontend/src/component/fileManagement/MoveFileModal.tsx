import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import { getDirectoryList } from 'api';
import { handleMoveFile } from 'api';
import { FileDTO } from '@DTO';
import { applyEscapeString, getFiles } from '@util';
import Button from '@component/common/Button';

interface Props {
	onCloseButton?: boolean;
	isOpenMoveFile: boolean;
	setIsOpenMoveFile: React.Dispatch<React.SetStateAction<boolean>>;
	selectedFiles: Map<string, FileDTO>;
	setSelectedFiles: React.Dispatch<React.SetStateAction<Map<string, FileDTO>>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	curDir: string;
}

const MoveFileModal: React.FC<Props> = ({
	onCloseButton = true,
	isOpenMoveFile,
	setIsOpenMoveFile,
	selectedFiles,
	setSelectedFiles,
	curDir,
	setFiles,
}) => {
	const [directories, setDirectories] = useState<string[]>([]);
	const [newDirectory, setNewDirectory] = useState<string>('');

	const handleDirectoryList = () => {
		const asyncFunc = async () => {
			let tempDirectories: string[] = await getDirectoryList();
			tempDirectories.unshift('/');

			tempDirectories = [...selectedFiles.values()].reduce((prev, file) => {
				if (file.contentType !== 'folder') {
					return prev;
				}

				const { directory, name } = file;
				const targetDir = directory === '/' ? `/${name}` : `${directory}/${name}`;
				const regex = new RegExp(`^${applyEscapeString(targetDir)}(\\/.*)?$`);
				const result = prev.filter((ele) => !regex.test(ele));

				return result;
			}, tempDirectories);

			tempDirectories = tempDirectories.filter((dir: string) => dir !== curDir);
			setDirectories(tempDirectories);
		};
		asyncFunc();
	};

	const makeDirectoryList = useCallback(() => {
		return directories.map((directory: string) => {
			return (
				<DirectoryComp
					key={directory}
					directory={directory}
					newDirectory={newDirectory}
					setNewDirectory={setNewDirectory}
				/>
			);
		});
	}, [directories, newDirectory]);

	const moveFile = async () => {
		setIsOpenMoveFile(false);
		if (newDirectory != '') {
			const targetIds = [...selectedFiles.keys()];
			const status = await handleMoveFile(targetIds, newDirectory, curDir);
			if (status) {
				setFiles(await getFiles(curDir, true));
				setSelectedFiles(new Map<string, FileDTO>());
			}
		}
	};

	const onRequestClose = useCallback(() => {
		if (onCloseButton) {
			setIsOpenMoveFile(false);
		}
	}, [onCloseButton]);

	useEffect(handleDirectoryList, []);

	return (
		<ReactModal
			isOpen={isOpenMoveFile}
			onRequestClose={onRequestClose}
			ariaHideApp={false}
			style={{
				content: {
					width: '400px',
					height: '280px',
					border: '1px solid #ccc',
					background: '#fff',
					overflow: 'auto',
					WebkitOverflowScrolling: 'touch',
					borderRadius: '4px',
					outline: 'none',
					padding: '20px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				},
			}}
		>
			<Container>
				<Directories>{makeDirectoryList()}</Directories>
				<MoveFileButton onClick={moveFile}>여기로 이동</MoveFileButton>
			</Container>
		</ReactModal>
	);
};

interface DirectoryCompProps {
	directory: string;
	setNewDirectory: React.Dispatch<React.SetStateAction<string>>;
	newDirectory: string;
}

const DirectoryComp: React.FC<DirectoryCompProps> = ({
	directory,
	setNewDirectory,
	newDirectory,
}) => {
	const onClick = () => {
		setNewDirectory(directory);
	};

	return (
		<DirectoryCompContainer onClick={onClick} selected={directory === newDirectory}>
			{directory === '/' ? '내 스토어' : directory}
		</DirectoryCompContainer>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100%;
`;

const MoveFileButton = styled(Button)`
	background-color: ${(props) => props.theme.color.Primary};
	margin-top: auto;
	color: white;
	padding: 10px;
	border: none;
	box-shadow: 3px 1px 3px grey;
	font-size: ${(props) => props.theme.fontSize.Content};
`;

const Directories = styled.ul`
	width: 100%;
	padding: 0;
	overflow-y: auto;
`;

const DirectoryCompContainer = styled.li<{ selected: boolean }>`
	cursor: pointer;
	list-style: none;
	font-size: ${(props) => props.theme.fontSize.Content};
	padding: 10px 0px 10px 0px;
	width: 100%;
	&:hover {
		background-color: ${(props) => !props.selected && props.theme.color.SecondaryBG};
	}
	background-color: ${(props) => props.selected && props.theme.color.Line};
`;
export default MoveFileModal;
