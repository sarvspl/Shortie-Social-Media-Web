import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { baseURL } from "../util/config";
import styles from "./share.module.css";
import { getAppLinks } from "../store/settingSlice";
import { RootStore, useAppDispatch, useAppSelector } from "@/store/store";

const q = (v: string | string[] | undefined) =>
  v === undefined ? undefined : Array.isArray(v) ? v[0] : v;

const slugify = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const normalizeBase = (websiteUrl: string) => {
  const raw = websiteUrl || baseURL;
  return raw.endsWith("/") ? raw : `${raw}/`;
};

const buildWebDestination = (
  params: Record<string, unknown> = {},
  websiteUrl = "",
) => {
  const pageRoute = q(params.pageRoute as string | string[] | undefined);

  // console.log(pageRoute)
  const id =
    q(params.id as string | string[] | undefined) ??
    q(params.userId as string | string[] | undefined);

  if (!pageRoute || !id) {
    return websiteUrl || baseURL;
  }

  const base = normalizeBase(websiteUrl);

  // console.log("base", base)

  if (pageRoute === "reels") {
    return `${base}reels?videoId=${encodeURIComponent(id)}`;
  }

  if (pageRoute === "feed") {
    return `${base}feed?userId=${encodeURIComponent(id)}`;
  }

  if (pageRoute === "live") {
    return `${base}live/${encodeURIComponent(id)}`;
  }

  if (pageRoute === "stream") {
    const roomId = q(params.roomId as string | string[] | undefined);
    const liveUserId = q(params.liveUserId as string | string[] | undefined);
    const image = q(params.image as string | string[] | undefined);
    const streamName = q(params.name as string | string[] | undefined);
    const username = q(params.username as string | string[] | undefined);

    const path = `${base}stream/${encodeURIComponent(id)}`;
    const search = new URLSearchParams();
    if (roomId) search.set("liveHistoryId", roomId);
    if (liveUserId) {
      search.set("liveId", liveUserId);
      search.set("streamerId", liveUserId);
    }
    if (image) search.set("streamerImage", image);
    if (streamName) search.set("streamerName", streamName);
    if (username) search.set("streamerUserName", username);
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  }

  if (pageRoute === "user-profile") {
    // console.log('entered')
    return `${base}user-profile/${encodeURIComponent(id)}`;
  }

  return websiteUrl || baseURL;
};

const SharePage = () => {
  const router = useRouter();
  const {
    pageRoute,
    id,
    userId,
    episodeNumber,
    movieName,
    roomId,
    liveUserId,
    image,
    name,
    username,
  } = router.query;
  const dispatch = useAppDispatch();
  const { appLinks } = useAppSelector((state: RootStore) => state.setting);

  useEffect(() => {
    dispatch(getAppLinks());
  }, [dispatch]);

  const webDestination = useMemo(() => {
    if (!router.isReady || !appLinks?.websiteUrl) {
      return appLinks?.websiteUrl;
    }

    // console.log('called buildweb')

    return buildWebDestination(
      {
        pageRoute,
        id,
        userId,
        episodeNumber,
        movieName,
        roomId,
        liveUserId,
        image,
        name,
        username,
      },
      appLinks?.websiteUrl,
    );
  }, [
    router.isReady,
    appLinks?.websiteUrl,
    pageRoute,
    id,
    userId,
    episodeNumber,
    movieName,
    roomId,
    liveUserId,
    image,
    name,
    username,
  ]);

  useEffect(() => {
    if (!router.isReady) return;

    if (typeof window !== "undefined" && webDestination) {
      // console.log(webDestination)
      window.location.replace(webDestination);
    }
  }, [router.isReady, webDestination]);

  const handleGoToWeb = () => {
    if (typeof window !== "undefined") {
      window.open(webDestination, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.gradientBackground}>
        <img
          src="/images/bg-share.jpg"
          alt=""
          className={styles.downloadBgTop}
        />

        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.textColumn}>
              <h1 className={styles.heading}>
                <span className={styles.gradientText}>Experience Stories</span>
                <span className={styles.normalText}>On the Go</span>
              </h1>

              <p className={styles.subheading}>
                Discover a world of romance, mystery, and thrilling stories with
                StoryBox. Enjoy exclusive content, smooth reading, and regular
                updates — all in one place. Download the StoryBox app today and
                enjoy unlimited entertainment anytime, anywhere.
              </p>

              <div className={styles.ctaRow}>
                <button
                  onClick={() =>
                    typeof window !== "undefined" &&
                    window.open(appLinks?.iosAppLink, "_blank")
                  }
                  className={styles.storeButton}
                >
                  <img src="/images/appStore.svg" className={styles.icon} />
                  <div>
                    <div className={styles.storeLabelTop}>Download on the</div>
                    <div className={styles.storeLabelBottom}>App Store</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    typeof window !== "undefined" &&
                    window.open(appLinks?.androidAppLink, "_blank")
                  }
                  className={styles.storeButtonPurple}
                >
                  <img src="/images/playStoree.svg" className={styles.icon} />
                  <div>
                    <div className={styles.storeLabelTop}>Get it on</div>
                    <div className={styles.storeLabelBottom}>Play Store</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleGoToWeb}
                  className={styles.storeButtonPurple}
                >
                  <img
                    src="/images/web.svg"
                    className={styles.icon}
                    style={{ color: "white" }}
                  />
                  <div>
                    <div className={styles.storeLabelTop}>Visit our</div>
                    <div className={styles.storeLabelBottom}>Website</div>
                  </div>
                </button>
              </div>

              <div className={styles.featuresWrapper}>
                <p className={styles.featuresTitle}>
                  Available on all major platforms
                </p>

                <div className={styles.featuresRow}>
                  <span>✓ Free Download</span>
                  <span>✓ Regular Updates</span>
                  <span>✓ 24/7 Support</span>
                </div>
              </div>
            </div>

            <div className={styles.imageColumn}>
              <img
                src="/images/share-mobile.png"
                alt="preview"
                className={styles.phoneImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
