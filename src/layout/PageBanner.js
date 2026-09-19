import Link from "next/link";
import { useLanguage } from "../i18n/LanguageContext";

const PageBanner = ({ pageTitle, motherTitle, url, compact }) => {
  const { t } = useLanguage();
  return (
    <div id="breadcrumb" className={`division${compact ? " breadcrumb-compact" : ""}`}>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="breadcrumb-holder">
              {/* Breadcrumb Nav */}
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link legacyBehavior href="/">
                      {t("breadcrumb.home")}
                    </Link>
                  </li>
                  {motherTitle && (
                    <li className="breadcrumb-item">
                      <Link legacyBehavior href={`/${url}`}>
                        {t(`banner.mother.${motherTitle}`, motherTitle)}
                      </Link>
                    </li>
                  )}
                  <li
                    className="breadcrumb-item active text-uppercase"
                    aria-current="page"
                  >
                    {t(`banner.${pageTitle}`, pageTitle)}
                  </li>
                </ol>
              </nav>
              {/* Title */}
              {/* <h4 className="h4-sm steelblue-color text-uppercase">{pageTitle}</h4> */}
            </div>
          </div>
        </div>{" "}
        {/* End row */}
      </div>{" "}
      {/* End container */}
    </div>
  );
};

export default PageBanner;
