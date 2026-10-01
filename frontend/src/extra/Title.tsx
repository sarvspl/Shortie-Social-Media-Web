import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import moment from "moment";
import MultiButton from "./MultiButton";
import { DateRangePicker, defaultStaticRanges, createStaticRanges } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const customStaticRanges = [
  ...createStaticRanges([
    {
      label: 'ALL',
      range: () => ({
        startDate: new Date("1970-01-01"),
        endDate: new Date(),
      })
    }
  ]),
  ...defaultStaticRanges
];

export default function Title(props: any) {
  const {
    newClass,
    name,
    dayAnalyticsShow,
    titleShow,
    setStartDate,
    setEndDate,
    endDate,
    startDate,
    setMultiButtonSelect,
    multiButtonSelect,
    labelData,
    color,
    bgColor,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const [dateRange, setDateRange] = useState([
    {
      startDate:
        startDate === "All" || !startDate
          ? new Date("1970-01-01")
          : moment(startDate).toDate(),
      endDate:
        endDate === "All" || !endDate ? new Date() : moment(endDate).toDate(),
      key: "selection",
    },
  ]);

  const handleDateChange = (item: any) => {
    setDateRange([item.selection]);
    const start = item.selection.startDate;
    const end = item.selection.endDate;

    if (start && end) {
      let startStr = dayjs(start).format("YYYY-MM-DD");
      let endStr = dayjs(end).format("YYYY-MM-DD");

      const todayStr = moment().format("YYYY-MM-DD");
      if (startStr === "1970-01-01" && endStr === todayStr) {
        startStr = "All";
        endStr = "All";
      }
      setStartDate(startStr);
      setEndDate(endStr);
    }
  };

  const displayDate = () => {
    if (startDate === "All" || startDate === "ALL") return "Select Date Range";
    if (!startDate || !endDate) return "Select Date Range";
    return `${moment(startDate).format("MM/DD/YYYY")} - ${moment(endDate).format("MM/DD/YYYY")}`;
  };

  return (
    <>
      <div>
        <div className="row align-items-center ">
          <div
            className={` ${dayAnalyticsShow
              ? `col-12 col-sm-12 col-md-6 ${titleShow ? "col-lg-6" : "col-lg-8"
              }`
              : "col-12"
              }`}
          >
            {titleShow && (
              <div className={!newClass ? `boxBetween ` : `${newClass}`}>
                <div className="title">
                  <h4
                    className="mb-0 text-capitalize text-nowrap"
                    style={{ fontSize: "20px", fontWeight: "500" }}
                  >
                    {name}
                  </h4>
                </div>
              </div>
            )}
            <div className="multi-user-btn">
              <MultiButton
                multiButtonSelect={
                  multiButtonSelect ? multiButtonSelect : titleShow
                }
                setMultiButtonSelect={
                  setMultiButtonSelect ? setMultiButtonSelect : ""
                }
                label={labelData ? labelData : []}
              />
            </div>
          </div>
          {dayAnalyticsShow && (
            <div
              className={`col-12 col-sm-12 col-md-6 pl-0 ${titleShow ? "col-lg-6" : "col-lg-4"
                }`}
              style={{ paddingRight: "10px", paddingLeft: "0px" }}
            >
              <div className="dayAnalytics justify-content-end">
                <div className="date-range-box" ref={wrapperRef} style={{ position: "relative" }}>
                  <input
                    readOnly
                    onClick={() => setIsOpen(!isOpen)}
                    value={displayDate()}
                    className={`daterange float-right mr-4 text-center ${bgColor} ${color}`}
                    style={{
                      fontWeight: 500,
                      cursor: "pointer",
                      background: "white",
                      color: "rgba(0, 0, 0, 0.87)",
                      display: "flex",
                      width: "100%",
                      minWidth: "220px",
                      justifyContent: "end",
                      fontSize: "13px",
                      padding: "7px 10px",
                      maxWidth: "250px",
                      borderRadius: "5px",
                      border: "1px solid #997CFA",
                    }}
                  />
                  {isOpen && (
                    <div style={{ position: "absolute", top: "45px", right: "0", zIndex: 9999, boxShadow: "0px 4px 12px rgba(0,0,0,0.15)", borderRadius: "8px", overflow: "hidden" }}>
                      <DateRangePicker
                        onChange={handleDateChange}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={dateRange}
                        direction="horizontal"
                        staticRanges={customStaticRanges}
                        inputRanges={[]}
                        shownDate={new Date()}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
