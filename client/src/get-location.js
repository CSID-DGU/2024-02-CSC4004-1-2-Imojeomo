function sample5_execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            var addr = data.address; // 최종 주소 변수
                
            // 주소로 상세 정보를 검색
            geocoder.addressSearch(data.address, function(results, status) {
                // 정상적으로 검색이 완료됐으면
                if (status === daum.maps.services.Status.OK) {
                    var result = results[0]; // 첫 번째 결과의 값을 활용

                    // 해당 주소에 대한 좌표를 받아서
                    var coords = new daum.maps.LatLng(result.y, result.x);

                    // 지도를 보여준다.
                    mapContainer.style.display = "block";
                    map.relayout();

                    // 지도 중심을 변경한다.
                    map.setCenter(coords);

                    // 좌표를 배열에 추가
                    coordinates.push({ x: parseFloat(result.x), y: parseFloat(result.y) });
                    console.log("좌표가 추가되었습니다:", coordinates);

                    // 마커를 추가하려면 최대 10개까지만 추가
                    if (markers.length < 10) {
                        // 새 마커를 생성하고 지도에 표시
                        var newMarker = new daum.maps.Marker({
                            position: coords,
                            map: map
                        });

                        // 마커를 배열에 저장
                        markers.push(newMarker);

                        // LatLngBounds 객체에 마커 위치 추가
                        bounds.extend(coords);

                        // 새로운 주소 텍스트 필드를 생성
                        var addressList = document.getElementById("address-list");
                        var newInput = document.createElement("input");
                        newInput.type = "text";
                        newInput.value = addr; // 새 입력 칸에 주소 추가
                        newInput.disabled = true; // 수정 불가능하도록 설정
                        addressList.appendChild(newInput);

                        // 모든 마커를 볼 수 있도록 지도 확대율 조정
                        map.setBounds(bounds);
      
                    } else {
                        alert("최대 10개의 마커만 표시할 수 있습니다.");
                    }
                }
            });
        }
    }).open();
}