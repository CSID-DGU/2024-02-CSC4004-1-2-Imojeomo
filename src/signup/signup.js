/* global kakao */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        residence: '',
    });
    const [map, setMap] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // 카카오 지도 API 초기화
        const mapContainer = document.getElementById('map'); // 지도를 표시할 div
        const mapOption = {
            center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심 좌표
            level: 3, // 확대 레벨
        };

        const kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
        const kakaoGeocoder = new kakao.maps.services.Geocoder();

        setMap(kakaoMap);
        setGeocoder(kakaoGeocoder);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchAddress = () => {
        if (!geocoder) return;

        const addressInput = document.getElementById('address-input').value;
        geocoder.addressSearch(addressInput, (results, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const result = results[0];
                const coords = new kakao.maps.LatLng(result.y, result.x);

                // 지도 중심 이동 및 마커 표시
                map.setCenter(coords);
                new kakao.maps.Marker({
                    map: map,
                    position: coords,
                });

                setSelectedAddress(result.address_name);
                setFormData({ ...formData, residence: result.address_name });
            } else {
                alert('주소를 찾을 수 없습니다.');
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/register', formData);
            console.log(response.data); // 회원가입 성공 메시지 처리
            navigate('/login');
        } catch (error) {
            console.error('회원가입 실패:', error.response?.data.message || error.message);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>이름:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>아이디:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>이메일:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>거주지:</label>
                    <input
                        type="text"
                        id="address-input"
                        placeholder="주소를 입력하세요"
                    />
                    <button type="button" onClick={handleSearchAddress}>주소 검색</button>
                    <div id="map" style={{ width: '100%', height: '300px', marginTop: '10px' }}></div>
                    <p>선택된 주소: {selectedAddress}</p>
                </div>
                <button type="submit">회원가입</button>
                <button type="button" onClick={handleLoginRedirect}>로그인 페이지로</button>
            </form>
        </div>
    );
}

export default Signup;
