import React, { Fragment, useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import messages from "../../i18n/messages";
import { buildPrice } from "./logic";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { useParams } from "react-router-dom";
import { Transition, Dialog } from "@headlessui/react";
import { FETCH_TAX_GROUPS } from "../TaxGroup/logic";
import { XIcon } from "@heroicons/react/outline";
import { priceColors } from "../../utils/colors";

import PriceForm from "./PriceForm";
import { usePrices } from "../../hooks/usePrices";

export default function NewPrice() {
  const { formatMessage: f } = useIntl();
  const [show, setShow] = useState(false);
  const { data: taxGroupData } = useQuery(FETCH_TAX_GROUPS);
  const { id } = useParams();
  const [prices] = usePrices(id);
  const navigate = useNavigate();
  const focusFieldRef = useRef(null);
  const handleClose = () => {
    setShow(false);
    navigate(`/events/${id}/prices`);
  };

  const handleCloseFromForm = (priceId: string | null) => {
    setShow(false);
    if (priceId) {
      navigate(`/events/${id}/prices/edit/${priceId}`);
      return;
    }
    navigate(`/events/${id}/prices`);
  };

  useEffect(() => setShow(true), []);

  const price = buildPrice(
    id,
    undefined,
    taxGroupData && taxGroupData.tax_groups && taxGroupData.tax_groups[0]
      ? taxGroupData.tax_groups[0].id
      : null
  );
  if (prices) {
    price.color = priceColors[prices.length];
  }

  return (
    <Transition.Root show={show} as={Fragment}>
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-brand-600"
                  >
                    {f(messages.newPrice)}
                  </Dialog.Title>
                </div>
                <div
                  className="mx-auto flex-shrink-0 flex items-center justify-center h-8 w-8 sm:-mt-2 sm:-mr-2 sm:h-10 sm:w-10 cursor-pointer"
                  onClick={handleClose}
                >
                  <XIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2">
                <PriceForm price={price} handleClose={handleCloseFromForm} />
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
