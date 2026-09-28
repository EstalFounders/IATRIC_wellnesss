import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { speciality as SPECIALITY_FALLBACK } from "../constant";
import { servicesData } from "../../data/services";
import { fetchGlobalData } from "../components/ApiService/UtilService";

// Presentation assets (icons/images/descriptions) stay keyed by name because the DB
// only stores name/description/fee.
export const getServiceAsset = (name) =>
  servicesData.find(
    (item) => item.name?.toLowerCase() === String(name || "").toLowerCase()
  ) || null;

export const slugifyService = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

// Merges the DB list (which items exist) with the static presentation list
// (icon/image/description/slug). DB order + DB membership win; unknown names still
// render with sensible defaults instead of disappearing.
export const mergeServiceLists = (dbList, staticList, staticNameKey = "title") => {
  if (!dbList?.length) return staticList || [];

  return dbList.map((item) => {
    const asset =
      (staticList || []).find(
        (entry) =>
          String(entry[staticNameKey] || entry.name || "").toLowerCase() ===
          String(item.name || "").toLowerCase()
      ) || {};

    return {
      ...asset,
      name: item.name,
      title: asset[staticNameKey] || asset.name || item.name,
      description: item.description || asset.description,
    };
  });
};

// Blended source of truth: the globalData slice wins when populated, otherwise the
// static lists act as fallback/first paint so the initial HTML keeps service names.
export const useGlobalData = () => {
  const dispatch = useDispatch();
  const services = useSelector((state) => state.globalData?.services);
  const speciality = useSelector((state) => state.globalData?.speciality);

  useEffect(() => {
    if (!services?.length && !speciality?.length) fetchGlobalData(dispatch);
  }, [dispatch, services?.length, speciality?.length]);

  return useMemo(() => {
    const serviceList = services?.length ? services : servicesData;
    const specialityList = speciality?.length
      ? speciality
      : SPECIALITY_FALLBACK.map((name) => ({ name }));

    return {
      services: serviceList,
      speciality: specialityList,
      serviceNames: serviceList.map((item) => item.name),
      specialityNames: specialityList.map((item) => item.name),
    };
  }, [services, speciality]);
};

export default useGlobalData;
