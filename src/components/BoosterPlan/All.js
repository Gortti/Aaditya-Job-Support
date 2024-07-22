import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import IconContainer from "../Common/IconContainer";
import * as Ionicons from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { retrieveBoosterplan, restoreBoosterplan, deleteBoosterplan } from "../../redux/actions/boosterplan";
import { toast, Slide } from "react-toastify";
import FilterComponent from "../../helpers/FilterComponent";
import debounceFunction from "../../helpers/Debounce";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import styles from "../../assets/preview.module.scss";
import PageContainer from "../Layout/PageContainer";
import Loader from "react-loaders";

const EditIcon = Ionicons["IoIosCreate"];
const DeleteIcon = Ionicons["IoIosTrash"];
const RestoreIcon = Ionicons["IoIosRefresh"];
// const ActiveIcon = Ionicons["IoIosCheckmarkCircleOutline"];
// const InactiveIcon = Ionicons["IoIosCloseCircle"];

toast.configure();

const BoosterList = () => {
    const navigate = useNavigate();
    const { boosterPlan, totalBoosterPlanCount } = useSelector((state) => state.boosterPlan);
    const { permissionMap: permissions } = useSelector((state) => state.auth);
    const currentModuleId = 22;
    const permission = permissions.find(perm => perm.moduleId === currentModuleId);
    const dispatch = useDispatch();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterText, setFilterText] = useState("");
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const param = {
        keyword: filterText,
        page: currentPage,
        perPage: perPage,
        all: true,
        active: true,
    };


    const fetchBooster = useCallback(() => {
        dispatch(retrieveBoosterplan(param));
        console.log("okay")
    }, [dispatch, filterText, currentPage, perPage]);

    useEffect(() => {
        fetchBooster();
    }, [fetchBooster, currentPage, perPage, filterText]);

    const handleViewClick = (row) => navigate(`/booster/${row.publicId}`);

    // const handleStatusToggle = (e, id, isActive) => {
    //     e.preventDefault();
    //     dispatch(activeStatusFaq(id, isActive, param))
    //         .then(() => {
    //             toast(`Account ${isActive ? "activated" : "deactivated"} successfully!`, {
    //                 transition: Slide,
    //                 closeButton: true,
    //                 autoClose: 3000,
    //                 position: "top-right",
    //                 type: "success",
    //             });
    //             fetchBooster();
    //         })
    //         .catch((error) => {
    //             toast(error.response?.data?.message || "An error occurred", {
    //                 transition: Slide,
    //                 closeButton: true,
    //                 autoClose: 3000,
    //                 position: "top-right",
    //                 type: "error",
    //             });
    //         });
    // };

    const handleDelete = (e, id, action) => {
        e.preventDefault();
        if (action === "delete") {
            dispatch(deleteBoosterplan(id, param))
                .then((res) => {
                    toast("Booster deleted successfully!", {
                        transition: Slide,
                        closeButton: true,
                        autoClose: 3000,
                        position: "top-right",
                        type: "success",
                    });
                    fetchBooster();
                })
                .catch((error) => {
                    console.log(error);
                    toast(error.response?.data?.message || "An error occurred", {
                        transition: Slide,
                        closeButton: true,
                        autoClose: 3000,
                        position: "top-right",
                        type: "error",
                    });
                });
        } else {
            dispatch(restoreBoosterplan(id))
                .then(() => {
                    toast("Banner restored successfully!", {
                        transition: Slide,
                        closeButton: true,
                        autoClose: 3000,
                        position: "top-right",
                        type: "success",
                    });
                    fetchBooster();
                })
                .catch((error) => {
                    toast(error.response?.data?.message || "An error occurred", {
                        transition: Slide,
                        closeButton: true,
                        autoClose: 3000,
                        position: "top-right",
                        type: "error",
                    });
                });
        }
    };

    const columns = useMemo(() => {
        const commonColumns = [
            {
                name: "Public Id",
                selector: (row) => row?.publicId,
                sortable: true,
                width: "100px",
                headerStyle: {
                    textAlign: "center",
                },
            },
            {
                name: "Booster Name ",
                selector: (row) => row?.name,
                sortable: true,
                headerStyle: {
                    textAlign: "center",
                },
            },
            {
                name: "Boost ",
                selector: (row) => row?.boost,
                sortable: true,
                headerStyle: {
                    textAlign: "center",
                },
            },
            {
                name: "Duration",
                selector: (row) => row?.duration,
                sortable: true,
                headerStyle: {
                    textAlign: "center",
                },
            },
            {
                name: "Price",
                selector: (row) => row?.price,
                sortable: true,
                headerStyle: {
                    textAlign: "center",
                },
            },
            {
                name: "Currency",
                selector: (row) => row?.currency,
                sortable: true,
                headerStyle: {
                    textAlign: "center",
                },
            },
            
            // {
            //     name: "Status",
            //     selector: (row) => (row.isActive ? "Active" : "Inactive"),
            //     sortable: true,
            //     width: "150px",
            //     headerStyle: {
            //         textAlign: "center",
            //     },
            // },
            {
                name: "Created At",
                selector: (row) => format(new Date(row?.createdAt), 'PPpp'),
                sortable: true,
                width: "230px",
                headerStyle: {
                    textAlign: "center",
                },
            },
        ];

        const renderActionCell = (row) => {
            const isDeleted = row?.deletedAt && row?.deletedAt !== null;
            if (isDeleted) {
                return permission?.delete ? (
                    <IconContainer
                        id={"restore-icon"}
                        Icon={RestoreIcon}
                        handleOnClick={(e) => handleDelete(e, row?.publicId, "restore")}
                        text={"Restore"}
                        iconColor={"#3ac47d"}
                    />
                ) : null;
            }

            return (
                <>
                    {permission?.update ? (
                        <IconContainer
                            id={"edit-icon"}
                            Icon={EditIcon}
                            handleOnClick={() => handleViewClick(row)}
                            text="Edit"
                        />
                    ) : null}
                    {permission?.delete ? (
                        <IconContainer
                            id={"delete-icon"}
                            Icon={DeleteIcon}
                            handleOnClick={(e) => handleDelete(e, row?.publicId, "delete")}
                            text={"Delete"}
                            iconColor={"#d92550"}
                        />
                    ) : null}
                    {/* {permission?.statusUpdate ? (
                        <IconContainer
                            id={"subadmin-active-icon"}
                            Icon={row.isActive ? ActiveIcon : InactiveIcon}
                            text={row.isActive ? "Active" : "Inactive"}
                            iconColor={row.isActive ? "#3ac47d" : "#d92550"}
                            handleOnClick={(e) => handleStatusToggle(e, row.publicId, !row.isActive)}
                        />
                    ) : null} */}
                </>
            );
        };

        if (
            permission?.delete === 0 &&
            permission?.update === 0 
        ) {
            return commonColumns;
        }

        return [
            ...commonColumns,
            {
                name: "Actions",
                button: true,
                minWidth: "150px",
                headerStyle: { textAlign: "center" },
                cell: renderActionCell,
            },
        ];
    }, [permission, handleViewClick, handleDelete]);

    const debounceSearch = useCallback(
        debounceFunction((nextValue) => {
            fetchBooster();
        }, 1000),
        [fetchBooster]
    );

    const subHeaderComponent = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText("");
                dispatch(retrieveBoosterplan({ ...param, keyword: "", page: 1 }));
            }
        };

        return (
            <FilterComponent
                onFilter={(event) => {
                    setFilterText(event.target.value);
                    debounceSearch(event.target.value);
                }}
                onClear={handleClear}
                filterText={filterText}
            />
        );
    }, [filterText, debounceSearch, resetPaginationToggle, dispatch, param]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage) => {
        setPerPage(newPerPage);
    };

    return (
        <PageContainer
            pageTitleIcon="pe-7s-rocket icon-gradient bg-plum-plate"
            pageHeading={"Booster Plan"}
            pageSubTitle={"List of all booster plans"}
        >
            

            {
                boosterPlan ? (<Row>
                    <Col>
                        <Card className="main-card mb-3">
                            <CardBody>
                                <DataTable
                                    columns={columns}
                                    data={boosterPlan}
                                    pagination
                                    paginationServer
                                    paginationTotalRows={totalBoosterPlanCount}
                                    paginationDefaultPage={currentPage}
                                    onChangeRowsPerPage={handlePerRowsChange}
                                    onChangePage={handlePageChange}
                                    subHeader
                                    subHeaderComponent={subHeaderComponent}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>) : (<Row>
                    <Col md="12">
                      <Card className="main-card mb-3">
                        <div
                          className="loader-container"
                          style={{ width: "75vw", height: "75vh" }}
                        >
                          <div className="loader-container-inner">
                            <div className="text-center">
                              <Loader type="ball-pulse-rise" />
                            </div>
                            <h6 className="mt-5">Please wait...</h6>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>)
            }
        </PageContainer>
    );
};

export default BoosterList;