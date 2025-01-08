const handleShareLocation = (location, viewPayload, messageApi) => {
    const [lat, lng] = location;
    console.log(location);
    const locationNow = window.location;
    let searchQuery = locationNow.search.split('&').map((item) => {
        if (item.startsWith('vitri')) {
            return `vitri=${lat}%2C${lng}`;
        }
        return item;
    });
    if (!searchQuery.includes('ups=sharing')) {
        searchQuery.push('ups=sharing');
    }

    if (viewPayload?.id) {
        const isLocationExist = searchQuery.some((item, index) => {
            if (item.includes('locationId')) {
                searchQuery[index] = `locationId=${viewPayload.id}`;
                return true;
            }
        });
        if (!isLocationExist) {
            searchQuery.push(`locationId=${viewPayload.id}`);
        }
    }
    // if (zoom) {
    //     searchQuery = searchQuery.filter((item) => !item.includes('zoom'));
    //     searchQuery.push('zoom=20');
    // }

    // set query params by view payload
    // if (viewPayload.type === 'video') {
    //     searchQuery.push(`marker-id=${viewPayload.imageId}`);
    // } else if (viewPayload.type === '360') {
    //     searchQuery.push(`marker-id=${viewPayload.imageId}`);
    // } else {
    //     searchQuery.push(`marker-id=${viewPayload.imageId}`);
    // }

    const newUrl = `${locationNow.origin}${locationNow.pathname}${searchQuery.join('&')}`;
    if (location) {
        navigator.clipboard
            .writeText(newUrl)
            .then(() => {
                messageApi.open({
                    type: 'success',
                    content: 'Đã sao chép vào bộ nhớ',
                });
            })
            .catch((err) => {
                messageApi.open({
                    type: 'error',
                    content: 'Lỗi khi sao chép vào bộ nhớ',
                });
            });
    } else {
        messageApi.open({
            type: 'info',
            content: 'Bạn vui lòng chọn lại vị trí',
        });
    }
};

export default handleShareLocation;
