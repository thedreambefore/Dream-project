// src/pages/UserDashboard/components/AccountTab/components/useTaiwanAddress.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { TW_ZIP_CODES } from '@/constants/twzipcode';

export function useTaiwanAddress(
  initialValue: string,
  onChange: (formattedAddress: string) => void
) {
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [neighbor, setNeighbor] = useState('');
  const [street, setStreet] = useState('');

  // 反向解析國稅局標準免扣繳憑單格式：[100]台北市中正區建國里005鄰重慶南路一段122號
  useEffect(() => {
    if (!initialValue) return;
    const match = initialValue.match(
      /^(?:\[?(\d{3})\]?)?([^\s市縣]+[市縣])([^\s區鄉鎮市]+[區鄉鎮市])([^\s村里]+[村里])?(\d{1,3})鄰(.+)$/
    );
    if (match) {
      setCity(match[2] || '');
      setDistrict(match[3] || '');
      setVillage(match[4] || '');
      setNeighbor(String(parseInt(match[5] || '0', 10)));
      setStreet(match[6] || '');
    } else {
      setStreet(initialValue);
    }
  }, []);

  const districtList = useMemo(() => {
    const found = TW_ZIP_CODES.find((c) => c.city === city);
    return found ? found.districts : [];
  }, [city]);

  const currentZip = useMemo(() => {
    const found = districtList.find((d) => d.name === district);
    return found ? found.zip : '';
  }, [districtList, district]);

  const handleCityChange = useCallback((newCity: string) => {
    setCity(newCity);
    const targetCityData = TW_ZIP_CODES.find((c) => c.city === newCity);
    setDistrict(targetCityData?.districts[0]?.name || '');
  }, []);

  const handleNeighborChange = useCallback((val: string) => {
    setNeighbor(val.replace(/\D/g, ''));
  }, []);

  // 匯流成標準國稅局格式通知父層
  useEffect(() => {
    if (!city || !district) {
      onChange(street.trim());
      return;
    }
    const formattedNeighbor = neighbor ? `${neighbor.padStart(3, '0')}鄰` : '000鄰';
    const cleanVillage = village
      ? village.endsWith('村') || village.endsWith('里')
        ? village
        : `${village}里`
      : '';
    onChange(`[${currentZip}]${city}${district}${cleanVillage}${formattedNeighbor}${street.trim()}`);
  }, [city, district, village, neighbor, street, currentZip, onChange]);

  return {
    city,
    district,
    village,
    setVillage,
    neighbor,
    street,
    setStreet,
    currentZip,
    districtList,
    handleCityChange,
    setDistrict,
    handleNeighborChange,
  };
}