import TablePagination from "react-js-pagination";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { useMediaQuery } from "@mui/material";

export default function Pagination(props: any) {
  const {
    type,
    setPage,
    userTotal,
    rowsPerPage,
    activePage,
    handleRowsPerPage,
    handlePageChange,
  } = props;

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTabletOrDesktop = useMediaQuery("(min-width:600px)");
  const totalPages = Math.ceil(userTotal / rowsPerPage);

  const handlePage = (pageNumber: any) => {
    setPage(pageNumber);
    if (handlePageChange) handlePageChange(pageNumber);
  };

  const startEntry = (activePage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(activePage * rowsPerPage, userTotal);

  return (
    <>
    {
      userTotal > 0 && (
        <div className="row gx-0 custom-pagination m-0 w-100 p-3 align-items-center">
          <div className="col-md-4 col-12 d-flex align-items-center pagination-left justify-content-md-start justify-content-center">
            <p
              style={{
                marginBottom: "0px",
                color: "#1f1f1f",
                fontWeight: "500",
              }}
            >
              Row Per Page:
            </p>
            <select
              className="form-select mx-2 pageOption"
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPage(Number(e.target.value))}
              style={{ width: "80px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              {/* <option value={userTotal}>All</option> */}
            </select>
          </div>

          {type === "server" && userTotal > 0 && (
            <div className="col-md-8 col-12 pagination pagination-right d-flex gap-3 align-items-center justify-content-md-end justify-content-center mt-3 mt-md-0">
              <p className="text-nowrap" style={{ marginBottom: 0, fontWeight: 500 }}>
                Showing {startEntry} – {endEntry} of {userTotal} entries
              </p>
              <TablePagination
                activePage={activePage}
                itemsCountPerPage={rowsPerPage}
                totalItemsCount={userTotal}
                pageRangeDisplayed={isMobile ? 2 : 3}
                onChange={(page) => handlePage(page)}
                itemClass="page-item"
                firstPageText={<IconChevronsLeft size={16} />}
                lastPageText={<IconChevronsRight size={16} />}
                prevPageText={<IconChevronLeft size={16} />}
                nextPageText={<IconChevronRight size={16} />}
              />
            </div>
          )}

          {type === "client" && userTotal > 0 && (
            <>
              <div className="col-md-8 col-12 pagination d-flex gap-3 align-items-center justify-content-md-end justify-content-center mt-3 mt-md-0">
                <p
                  className="text-nowrap"
                  style={{
                    marginBottom: "0px",
                    color: "#1f1f1f",
                    fontWeight: "500",
                  }}
                >
                  Showing {activePage} out of {totalPages} pages
                </p>
                <div>
                  <TablePagination
                    activePage={activePage}
                    itemsCountPerPage={rowsPerPage}
                    totalItemsCount={userTotal}
                    pageRangeDisplayed={isMobile ? 2 : 3}
                    onChange={handlePage}
                    itemClass="page-item"
                    firstPageText={<IconChevronsLeft size={16} />}
                    lastPageText={<IconChevronsRight size={16} />}
                    prevPageText={<IconChevronLeft size={16} />}
                    nextPageText={<IconChevronRight size={16} />}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )
    }
    </>
  );
}
