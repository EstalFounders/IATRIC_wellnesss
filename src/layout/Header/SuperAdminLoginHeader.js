// SuperAdminLoginHeader.js - the chrome wrapped around every super-admin page.
//
// One 64px sticky bar: the drawer handle, the logo, the notification bell and
// the account menu. The bell opens the request modal as before, but its badge
// counts the pending requests (doctor updates + leaves + consultation
// requests) instead of the length of the whole notification feed. Each fetch
// is checked and the dead calculateCounts() helper - which pulled
// api.globalVar only to compute numbers nothing rendered - is gone.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoIosNotifications } from "react-icons/io";
import { useDispatch } from "react-redux";
import Navbar from "../../components/superAdminComponent/NavBarComponent/Navbar";
import RightSideMenu from "../../components/superAdminComponent/NavBarComponent/RightSideMenu";
import SuperAdminModel from "../../components/superAdminComponent/model/SuperAdminModel";
import NotificationSection from "../../components/superAdminComponent/notifications/NotificationSection";
import { handleDoctReqApproveOrRejectService } from "../../components/superAdminComponent/apiService/doctrReApproveOrRejectService";
import { handleLeaveApproveOrRejectService } from "../../components/superAdminComponent/apiService/doctorLeaveApproveOrRejectService";
import { api, imageBlurDataUrl } from "../../constant";
import { getFilteredNotifications } from "../../helper";
import {
  setDoctorLeaveRequest,
  setDoctorUpdateRequest,
} from "../../store/slices/notificationSectionApiData";
import styles from "../css/SuperAdmin.module.css";

const SuperAdminLoginHeader = ({ session }) => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [doctorUpdateRequests, setDoctorUpdateRequests] = useState([]);
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchAPIs = useCallback(async () => {
    const load = async (url, label) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Could not load ${label}:`, error);
        return null;
      }
    };

    const [doctorData, leaveData, notificationData] = await Promise.all([
      load(api.doctorUpdateRequest, "doctor update requests"),
      load(api.leaveRequest, "leave requests"),
      load(api.superAdmin_notification, "notifications"),
    ]);

    if (Array.isArray(doctorData)) {
      setDoctorUpdateRequests(doctorData);
      dispatch(setDoctorUpdateRequest(doctorData));
    }
    if (Array.isArray(leaveData)) {
      setLeaveRequest(leaveData);
      dispatch(setDoctorLeaveRequest(leaveData));
    }
    if (Array.isArray(notificationData)) setNotifications(notificationData);
  }, [dispatch]);

  useEffect(() => {
    fetchAPIs();
  }, [fetchAPIs]);

  const { consultationRequests } = useMemo(
    () => getFilteredNotifications(notifications),
    [notifications]
  );

  const pendingCount =
    doctorUpdateRequests.length +
    leaveRequest.length +
    consultationRequests.length;

  const handleDoctReqApproveOrReject = async (id, action) => {
    try {
      await handleDoctReqApproveOrRejectService(id, action);
    } catch (error) {
      console.error("Error while processing the doctor update request:", error);
      window.alert("Something went wrong. Please try again later.");
    }
  };

  const handleLeaveApproveOrReject = async (id, action) => {
    try {
      await handleLeaveApproveOrRejectService(id, action);
    } catch (error) {
      console.error("Error while processing the leave request:", error);
      window.alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.leftGroup}>
            {session ? <Navbar /> : null}
            <Link className={styles.brand} href="/superAdmin/homepage">
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                src="/images/logo.png"
                width={150}
                height={44}
                alt="IATRIC Wellness"
                className={styles.logo}
                priority
              />
            </Link>
          </div>

          {session ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setShow(true)}
                aria-label={`Notifications and requests, ${pendingCount} pending`}
                aria-haspopup="dialog"
              >
                <IoIosNotifications size={26} />
                {pendingCount > 0 ? (
                  <span className={styles.badge}>
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                ) : null}
              </button>
              <RightSideMenu />
            </div>
          ) : null}
        </div>
      </header>

      <SuperAdminModel isOpen={show} onClose={() => setShow(false)}>
        <NotificationSection
          doctorUpdateRequests={doctorUpdateRequests}
          leaveRequest={leaveRequest}
          consultationRequests={consultationRequests}
          handleDoctReqApproveOrReject={handleDoctReqApproveOrReject}
          handleLeaveApproveOrReject={handleLeaveApproveOrReject}
        />
      </SuperAdminModel>
    </>
  );
};

export default SuperAdminLoginHeader;
