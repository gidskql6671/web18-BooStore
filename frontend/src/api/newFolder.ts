export const handleNewFolder = (newFolderName: string ,curDir: string)=>{
    return fetch(`/cloud/folder`,{
        method: 'POST',
        credentials: 'include',
        headers : {"Content-Type" : "application/json"},
        body: JSON.stringify(
            {
                "name":{newFolderName},
                "curdir":{curDir}
            }
        )
    })
        .then((res) => {
            return res.json();
            
        });
}