/* global kakao */

/**
 * 멤버들의 주소 좌표를 평균 내어 중심점을 계산
 * @param {Array} members - 멤버들의 주소 정보
 * @param {Object} geocoder - 카카오 지도 Geocoder 객체
 * @returns {Promise<Object>} - 평균 좌표 { x, y }
 */

// 중간 지점 계산 함수
export async function calculateMeanCoordinates(members, geocoder) {
    if (members.length === 0) {
        return null;
    }

    const addressPromises = members.map(
        (member) =>
            new Promise((resolve, reject) => {
                geocoder.addressSearch(member.address, (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        resolve({ x: parseFloat(result[0].x), y: parseFloat(result[0].y) });
                    } else {
                        reject(new Error(`주소 변환 실패: ${member.address}`));
                    }
                });
            })
    );

    try {
        const coordinates = await Promise.all(addressPromises);

        const sum = coordinates.reduce(
            (acc, coord) => ({
                x: acc.x + coord.x,
                y: acc.y + coord.y,
            }),
            { x: 0, y: 0 }
        );

        return {
            x: sum.x / coordinates.length,
            y: sum.y / coordinates.length,
        };
    } catch (error) {
        console.error("좌표 변환 실패:", error);
        throw error;
    }

}


/**
 * 지도에 중심 마커를 추가
 * @param {Object} map - 카카오 지도 객체
 * @param {Object} meanCoord - 중심 좌표 { x, y }
 * @returns {Object} - 생성된 마커
 */

// 중간 지점 마커 표시 함수

let markerCounter = 0;

export function addMeanMarker(map, meanCoord) {
    if (!meanCoord) {
        console.error("유효하지 않은 중심 좌표입니다.");
        return null;
    }

    const meanLatLng = new kakao.maps.LatLng(meanCoord.y, meanCoord.x);

    // 마커 생성
    const meanMarker = new kakao.maps.Marker({
        position: meanLatLng,
        map: map,
    });

    // ID 관리
    const markerId = `mean-marker-${++markerCounter}`;
    console.log(`새로운 중심 마커 생성, ID: ${markerId}`);

    map.setCenter(meanLatLng);
    return { marker: meanMarker, id: markerId };
}





/**
 * 지도에 반경 원을 추가
 * @param {Object} map - 카카오 지도 객체
 * @param {Object} meanCoord - 중심 좌표 { x, y }
 * @param {number} radius - 반경 (미터 단위)
 * @returns {Object} - 생성된 원
 */

export function addCircle(map, meanCoord, radius = 1500) {
    if (!meanCoord) {
        console.error("유효한 중심 좌표가 없습니다.");
        return null;
    }

    const meanLatLng = new kakao.maps.LatLng(meanCoord.y, meanCoord.x);

    // 반경 원 생성
    const circle = new kakao.maps.Circle({
        center: meanLatLng,
        radius: radius,
        strokeWeight: 5,
        strokeColor: '#75B8FA',
        strokeOpacity: 1,
        strokeStyle: 'dashed',
        fillColor: '#CFE7FF',
        fillOpacity: 0.7,
        map: map,
    });

    console.log(`반경 ${radius}m의 원이 추가되었습니다.`);
    return circle;
}


