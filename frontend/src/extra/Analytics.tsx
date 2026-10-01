import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import dayjs from "dayjs";
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

export default function Analytics(props: any) {
  const {
    analyticsStartDate,
    analyticsStartEnd,
    analyticsStartDateSet,
    analyticsStartEndSet,
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
        analyticsStartDate === "ALL" || !analyticsStartDate
          ? new Date("1970-01-01")
          : moment(analyticsStartDate).toDate(),
      endDate:
        analyticsStartEnd === "ALL" || !analyticsStartEnd
          ? new Date()
          : moment(analyticsStartEnd).toDate(),
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

      const todayStr = dayjs().format("YYYY-MM-DD");
      if (startStr === "1970-01-01" && endStr === todayStr) {
        startStr = "ALL";
        endStr = "ALL";
      }

      analyticsStartDateSet(startStr);
      analyticsStartEndSet(endStr);
    }
  };

  const displayDate = () => {
    if (analyticsStartDate === "ALL" || analyticsStartEnd === "ALL") return "Select Date Range";
    if (!analyticsStartDate || !analyticsStartEnd) return "Select Date Range";
    return `${moment(analyticsStartDate).format("MM/DD/YYYY")} - ${moment(analyticsStartEnd).format("MM/DD/YYYY")}`;
  };

  return (
    <div className="d-flex my-2" style={{ width: "250px" }} ref={wrapperRef}>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          value={displayDate()}
          className={`daterange float-right mr-4 text-center ${bgColor} ${color}`}
          style={{
            width: "100%",
            minWidth: "220px",
            fontWeight: 500,
            cursor: "pointer",
            background: "rgb(0 0 0 / 83%)",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            fontSize: "14px",
            padding: "16px 10px",
            borderRadius: "6px",
            border: "1px solid #997CFA",
            height: "48px ",
          }}
        />
        {isOpen && (
          <div style={{ position: "absolute", top: "55px", right: "15%", zIndex: 9999, boxShadow: "0px 4px 12px rgba(0,0,0,0.15)", borderRadius: "8px", overflow: "hidden", background: "white" }}>
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
  );
}
