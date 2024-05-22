import React, { Fragment, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { useParams } from "react-router-dom";
import { Transition, Dialog } from "@headlessui/react";
import { TrashIcon, XIcon } from "@heroicons/react/outline";
import { useDispatch } from "react-redux";

import messages from "../../../i18n/messages";
import Tooltip, { Placement } from "../../Tooltip/Tooltip";
import LoadingIcon from "../../Btn/LoadingIcon";
import { setMsg } from "../../Toaster/logic";
import PriceNameForm from "./PriceNameForm";
import { buildPriceName, DELETE_PRICE_NAME, FETCH_PRICE_NAMES, FETCH_PRICE_NAME_BY_ID } from "./logic";
import { FETCH_TAX_GROUPS } from "../../TaxGroup/logic";

export default function PriceNameModal() {
    const [showPriceNameModal, setShowPriceNameModal] = useState(true);
    const dispatch = useDispatch();
    const { priceNameId } = useParams();
    const { formatMessage: f } = useIntl();
    const focusFieldRef = useRef(null);
    const navigate = useNavigate();

    const { data: taxGroupData } = useQuery(FETCH_TAX_GROUPS);
    const { data: priceNameData, loading: loadingPriceNameData, error: fetchError } = useQuery(FETCH_PRICE_NAME_BY_ID, {
        variables: { id: priceNameId },
        skip: !priceNameId
    });
    const [deletePriceName, { loading: deleting }] = useMutation(DELETE_PRICE_NAME)


    if (fetchError) {
        dispatch(setMsg({ title: fetchError.message }));
    }

    const priceName = buildPriceName(priceNameData ? priceNameData.price_name : null, taxGroupData && taxGroupData.tax_groups && taxGroupData.tax_groups[0]
        ? taxGroupData.tax_groups[0].id
        : null);

    const handleClose = () => {
        setShowPriceNameModal(false);
        navigate('/settings/pricenames');
    }

    const handleDelete = async () => {
        try {
            await deletePriceName({
                variables: {
                    id: priceNameId
                },
                refetchQueries: [
                    {
                        query: FETCH_PRICE_NAMES,
                    },
                ],
            });
            dispatch(setMsg({ title: f(messages.priceNameDeleted), level: "success" }));
            handleClose();
        } catch (e) {
            dispatch(setMsg({ title: "ERROR", level: "error", desc: (e as Error).message }));
        }
    };

    return (
        <Transition.Root show={showPriceNameModal} as={Fragment}>
            <Dialog
                as="div"
                static
                className="fixed z-10 inset-0 overflow-y-auto"
                initialFocus={focusFieldRef}
                open
                onClose={handleClose}
            >
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg leading-6 font-medium text-brand-600"
                                    >
                                        {priceNameId ? f(messages.editPriceName) : f(messages.newPriceName)}
                                    </Dialog.Title>
                                </div>
                                {priceNameId ? (<Tooltip
                                    content={f(messages.deletePriceName)}
                                    placement={Placement.top}
                                >
                                    <div
                                        className="mx-auto flex-shrink-0 flex items-center justify-center h-8 w-8 sm:-mt-2 sm:-mr-2 sm:h-10 sm:w-10 cursor-pointer group"
                                        onClick={handleDelete}
                                    >
                                        {deleting ? (
                                            <LoadingIcon color="text-red-600" />
                                        ) : (
                                            <TrashIcon
                                                className="h-6 w-6 text-red-400 group-hover:text-red-600"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                </Tooltip>) : null}
                                <div
                                    className="mx-auto flex-shrink-0 flex items-center justify-center h-8 w-8 sm:-mt-2 sm:-mr-2 sm:h-10 sm:w-10 cursor-pointer"
                                    onClick={handleClose}
                                >
                                    <XIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                                </div>
                            </div>
                            <div className="mt-2">
                                {priceName && !loadingPriceNameData ? <PriceNameForm priceName={priceName} handleClose={handleClose} /> : null}
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );

}