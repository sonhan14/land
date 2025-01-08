import { useEffect, useState } from 'react';
import './BoxNewsItem.scss';
import { getGroupByBoxId } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
function BoxNewsItem({ data }) {
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();
    const handleClick = (id) => {
        navigate(`group/${id}`);
    };
    useEffect(() => {
        const fetchApi = async () => {
            const res = await getGroupByBoxId(data.BoxID);
            console.log(res);
            setGroups(res);
        };
        fetchApi();
    }, []);
    return (
        <div className="box-news">
            <h5 className="text-white">{data.BoxName}</h5>
            {groups.map((item, index) => (
                <div key={index} className="group" onClick={() => handleClick(item.GroupID)}>
                    <img src={item.avatarLink} />
                    <p className="text-white">{item.GroupName}</p>
                </div>
            ))}
        </div>
    );
}

export default BoxNewsItem;
