import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupByPage } from '../../../services/api';
import ReactPaginate from 'react-paginate';
import { FaEye } from 'react-icons/fa';
import './GroupNews.scss';
import ModalNotification from '../../Auth/ModalNotification';
import { useSelector } from 'react-redux';
function GroupNews() {
    const [articles, setArticles] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const { id } = useParams();
    const check = useSelector((state) => state.account);
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const [isShowModalLogin, setIsShowModalLogin] = useState(false);
    const handlePageClick = async (e) => {
        const fetchApi = async () => {
            const res = await getGroupByPage(id, e.selected + 1);
            setArticles(res.data);
        };
        fetchApi();
    };
    const handleCreate = () => {
        console.log(check);
        if (!isAuthenticated) {
            setIsShowModalLogin(true);
        }
    };
    useLayoutEffect(() => {
        const fetchApi = async () => {
            const res = await getGroupByPage(id, 1);
            setArticles(res.data);
            setTotalPage(parseInt(Math.ceil(res.total_page)));
        };
        fetchApi();
    }, []);

    return (
        <div className="group-news">
            <ReactPaginate
                previousLabel="<"
                nextLabel=">"
                breakLabel="..."
                pageCount={totalPage}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
            />
            <button className="btn btn-success button-create" onClick={handleCreate}>
                Tạo bài viết
            </button>
            <h4 className="text-white title">Các bài viết</h4>
            <div className="list-articles">
                {articles.map((item, index) => (
                    <div key={index} className="list-articles__item">
                        <>
                            <div className="content">
                                <h5 className="text-white">{item.Title}</h5>
                                <p className="text-secondary">{item.Content}</p>
                            </div>
                            <div className="view text-white">
                                <FaEye size={24} />
                                {item.timeView}
                            </div>
                        </>
                    </div>
                ))}
            </div>
            <ModalNotification
                show={isShowModalLogin}
                handleClose={() => {
                    setIsShowModalLogin(false);
                }}
            />
        </div>
    );
}

export default GroupNews;
