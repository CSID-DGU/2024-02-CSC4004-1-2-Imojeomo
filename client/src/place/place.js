/*global kakao, daum*/

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { initializeMap, addMarker, removeMarker, clearMarkers } from './map';
import { calculateMeanCoordinates, addMeanMarker, addCircle } from './middle-point';
import { searchSubwayStations } from './subway';
import './place.css';

function Place() {
    const [members, setMembers] = useState([]);
    const [toBeRemoved, setToBeRemoved] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [centerMarker, setCenterMarker] = useState(null);
    const [circle, setCircle] = useState(null);
    const [subwayMarkers, setSubwayMarkers] = useState([]);
    const [subwayList, setSubwayList] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search); // 쿼리 파라미터 읽기
    const teamId = queryParams.get('teamId');
    const eventId = queryParams.get('eventId');
    const navigate = useNavigate();



    // 지도 초기화
    useEffect(() => {
        const map = initializeMap('map');
        setMapInstance(map);

        return () => {
            clearMarkers(); // 모든 마커 제거
            if (centerMarker) {
                centerMarker.setMap(null);
                setCenterMarker(null);
            }
            if (circle) {
                circle.setMap(null);
                setCircle(null);
                subwayMarkers.forEach((marker) => marker.setMap(null));
            }
        };
    }, []);




    // 멤버 정보 가져오기
    useEffect(() => {
        const fetchMembers = async () => {
            if (!teamId) {
                console.error("teamId 없음");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/teams/${teamId}/members`);
                console.log("멤버 데이터:", response.data); // 디버깅용
                setMembers(
                    response.data.map((member) => ({
                        ...member,
                        address: member.address || "주소 없음", // 기본값 추가
                    }))
                );
            } catch (error) {
                console.error("멤버 데이터 가져오기 실패:", error);
            }
        };

        if (teamId) {
            fetchMembers();
        }
    }, [teamId]);


    // 멤버 주소로 마커 추가
    useEffect(() => {
        if (!mapInstance || members.length === 0) return;

        markers.forEach((markerObj) => {
            if (markerObj.marker instanceof kakao.maps.Marker) {
                markerObj.marker.setMap(null); // 지도에서 마커 제거
            }
        });

        setMarkers([]);

        const newMarkersPromises = members.map((member) =>
            addMarker(mapInstance, member.address, member.name)
                .then((markerObj) => markerObj)
                .catch((error) => console.error("마커 추가 오류:", error))
        );

        Promise.all(newMarkersPromises).then((newMarkers) => {
            setMarkers(newMarkers.filter(Boolean)); // 유효한 마커만 상태에 저장
        });
    }, [members, mapInstance]);


    // 중심 지점과 반경 원 자동 업데이트
    useEffect(() => {
        updateCenterPoint(members);
    }, [members, mapInstance]);

    useEffect(() => {
        // 지하철 마커 클릭 이벤트 등록
        subwayMarkers.forEach((marker, index) => {
            kakao.maps.event.addListener(marker, 'click', () => {
                const subwayName = subwayList[index]?.name; // 지하철역 이름 가져오기
                if (subwayName) {
                    handleSelectSubway(subwayName); // place 필드에 저장
                }
            });
        });

        return () => {
            // 컴포넌트 언마운트 시 마커 이벤트 제거
            subwayMarkers.forEach(marker => {
                kakao.maps.event.removeListener(marker, 'click');
            });
        };
    }, [subwayMarkers, subwayList]);




    // 중심지점과 원을 업데이트하는 헬퍼 함수
    const updateCenterPoint = async (membersList) => {
        if (!mapInstance || membersList.length === 0) return;

        try {
            const meanCoord = await calculateMeanCoordinates(membersList, new kakao.maps.services.Geocoder());
            if (!meanCoord) {
                console.error("중심 좌표 계산 실패: meanCoord가 유효하지 않음");
                return;
            }

            console.log("계산된 중심 좌표:", meanCoord);

            // 기존 중심 마커와 원 제거
            if (centerMarker) centerMarker.setMap(null);
            if (circle) circle.setMap(null);

            setCenterMarker(null);
            setCircle(null);

            // 새 중심 마커와 원 추가
            const newCenterMarker = addMeanMarker(mapInstance, meanCoord);
            const newCircle = addCircle(mapInstance, meanCoord, 1500);

            setCenterMarker(newCenterMarker.marker);
            setCircle(newCircle);

            console.log("중심 마커와 원 생성 완료");

            // **기존 지하철 마커 제거**
            subwayMarkers.forEach((marker) => marker.setMap(null));
            setSubwayMarkers([]); // 상태 초기화

            // 지하철 검색
            const searchResults = await searchSubwayStations(mapInstance, newCenterMarker.marker.getPosition(), 1500);
            if (!searchResults || searchResults.length === 0) {
                console.error("지하철 검색 결과 없음");
                setSubwayList([]);
                return;
            }

            console.log("지하철 검색 결과:", searchResults);

            // 상태 업데이트
            setSubwayMarkers(searchResults.map((result) => result.marker));
            setSubwayList(searchResults.map(({ name }) => ({ name: String(name) })));
        } catch (error) {
            console.error("중심 좌표 계산 실패:", error);
        }
    };








    //새로운 위치 추가
    const handleAddLocation = () => {
        new daum.Postcode({
            oncomplete: (data) => {
                const geocoder = new kakao.maps.services.Geocoder();

                if (!data.address || data.address.trim() === "") {
                    alert("유효하지 않은 주소입니다. 정확한 주소를 선택해 주세요.");
                    return;
                }

                geocoder.addressSearch(data.address, (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        const newAddress = data.address;

                        // 새로운 위치 추가
                        setMembers((prevMembers) => {
                            const updatedMembers = [
                                ...prevMembers,
                                {
                                    id: `guest-${Date.now()}`,
                                    name: 'guest',
                                    address: newAddress,
                                },
                            ];
                            updateCenterPoint(updatedMembers);
                            return updatedMembers;
                        });
                    } else {
                        alert('주소를 찾을 수 없습니다.');
                    }
                });
            },
        }).open();
    };

    // 위치 삭제
    const handleDeleteLocation = (id) => {
        setToBeRemoved(id);

        setTimeout(() => {
            const updatedMembers = members.filter((member) => member.id !== id);
            setMembers(updatedMembers); // 상태 변경
            setToBeRemoved(null); // 제거 애니메이션 종료
        }, 300);
    };


    // 지하철 검색
    const searchSubway = async () => {
        if (!mapInstance || !centerMarker) return;

        try {
            const position = centerMarker.getPosition();
            subwayMarkers.forEach((marker) => marker.setMap(null)); // 기존 지하철 마커 제거
            const markers = await searchSubwayStations(mapInstance, position, 1500); // subway.js 호출
            setSubwayMarkers(markers); // 새로 생성된 마커 저장
        } catch (error) {
            console.error("지하철 검색 실패:", error);
        }
    };

    const handleMouseOverSubway = (index) => {
        const marker = subwayMarkers[index];
        if (!marker) return;

        const subwayName = subwayList[index]?.name; // 지하철역 이름 가져오기
        if (!subwayName) {
            console.error("지하철역 이름을 가져올 수 없습니다.");
            return;
        }

        const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding: 5px; font-size: 12px;">${subwayName}</div>`,
            zIndex: 1,
        });

        infowindow.open(mapInstance, marker);

        // 마커에 인포윈도우 참조 저장 (옵션)
        marker.__infoWindow = infowindow;
    };



    const handleMouseOutSubway = (index) => {
        const marker = subwayMarkers[index];
        if (!marker || !marker.__infoWindow) return;

        marker.__infoWindow.close();
        marker.__infoWindow = null; // InfoWindow 해제
    };

    const handleSelectSubway = async (subwayName) => {
        if (!eventId) {
            console.error("eventId가 없습니다.");
            return;
        }

        try {
            // 서버에 선택된 지하철역 저장 요청
            const response = await axios.patch(`http://localhost:5000/api/events/${eventId}`, {
                place: subwayName
            });

            console.log("place 업데이트 성공:", response.data);

            // 저장 성공 후 이전 페이지로 이동
            navigate(-1); // 이전 페이지로 이동
        } catch (error) {
            console.error("place 업데이트 실패:", error);
        }
    };





    return (
        <div className="place-container">

            {/*로고*/}
            <aside className="team-header">
                <Link to="/team" className="logo-link">
                    <img src="/imo_logo_small.png" alt="IMO 로고" className="logo" />
                </Link>
            </aside>

            <div className="map-content">

                {/*지도*/}
                <div className="map-container">
                    <div id="map"></div>
                </div>

                <div className="added-container">
                    {/*멤버들 주소*/}
                    <div className="member-address">
                        <ul>
                            {members.map((member) => (
                                <li
                                    key={member.id}
                                    className={member.id === toBeRemoved ? 'removed' : ''}
                                >
                                    <span className="name">{member.name}</span>
                                    <span className="separator">:</span>
                                    <span className="address">{member.address}</span>
                                    <button
                                        className="delete-location-button"
                                        onClick={() => handleDeleteLocation(member.id)}
                                    >
                                        X
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="add-location-button"
                            onClick={handleAddLocation}
                        >
                            +
                        </button>

                    </div>

                    {/*추천장소리스트*/}
                    <div className="place-list">
                        <ul>
                            {subwayList.length > 0 ? (
                                subwayList.map((subway, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectSubway(subway.name)}
                                        onMouseOver={() => handleMouseOverSubway(index)}
                                        onMouseOut={() => handleMouseOutSubway(index)}
                                    >
                                        {subway.name}
                                    </li>
                                ))
                            ) : (
                                <li>반경 내 지하철역이 없습니다.</li>
                            )}
                        </ul>

                    </div>



                </div>

            </div>
        </div>
    )
};

export default Place;
