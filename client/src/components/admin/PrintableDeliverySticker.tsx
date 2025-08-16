import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

interface DeliveryStickerProps {
  orderId: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  orderTotal: number;
  orderDate: string;
  paymentMethod: string;

  onClose: () => void;
}

export function PrintableDeliverySticker({
  orderId,
  customerName,
  customerEmail,
  shippingAddress,
  orderTotal,
  orderDate,
  paymentMethod,
  onClose,
}: DeliveryStickerProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate barcode for order ID
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, `ORD-${orderId}`, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });
    }

    // Generate QR code with order details
    if (qrCodeRef.current) {
      const orderInfo = {
        orderId: `ORD-${orderId}`,
        customer: customerName,
        total: orderTotal,
        date: orderDate,
      };

      QRCode.toCanvas(qrCodeRef.current, JSON.stringify(orderInfo), {
        width: 120,
        margin: 2,
      });
    }
  }, [orderId, customerName, orderTotal, orderDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:relative print:inset-auto">
      <div className="bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:p-0">
        {/* Print controls - hidden when printing */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <h2 className="text-2xl font-bold">Delivery Sticker</h2>
          <div className="space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print Sticker
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable sticker content - A6 size optimized */}
        <div
          className="sticker-content print:w-full"
          style={{ width: "148mm", minHeight: "105mm" }}
        >
          {/* Header */}
          <div className="border-2 border-black p-4 bg-white">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold">HARVEST DIRECT</h1>
              <p className="text-sm">Farm to Table Delivery</p>
            </div>

            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">ORDER DETAILS</h3>
                <p className="text-xs">
                  <strong>Order ID:</strong> ORD-{orderId}
                </p>
                <p className="text-xs">
                  <strong>Date:</strong>{" "}
                  {new Date(orderDate).toLocaleDateString()}
                </p>
                <p className="text-xs">
                  <strong>Total:</strong> ₹{orderTotal.toFixed(2)}
                </p>
                <p className="text-xs">
                  <strong>Payment:</strong> {paymentMethod}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">CUSTOMER INFO</h3>
                <p className="text-xs">
                  <strong>Name:</strong> {customerName || "Guest Customer"}
                </p>
                <p className="text-xs">
                  <strong>Email:</strong> {customerEmail || "No email provided"}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">DELIVERY ADDRESS</h3>
              <div className="border border-gray-300 p-2 min-h-[60px] text-xs">
                {shippingAddress || "Address not provided"}
              </div>
            </div>

            {/* Barcodes */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="text-center">
                <p className="text-xs font-semibold mb-2">
                  SCAN FOR ORDER INFO
                </p>
                <canvas ref={qrCodeRef} className="mx-auto" />
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold mb-2">ORDER BARCODE</p>
                <svg ref={barcodeRef} className="mx-auto" />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 mt-4 pt-2 text-center">
              <p className="text-xs">
                For delivery support: support@harvestdirect.com |
                +91-XXXX-XXXX-XX
              </p>
              <p className="text-xs font-semibold">
                Handle with care - Fresh produce inside
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          .sticker-content,
          .sticker-content * {
            visibility: visible;
          }
          
          .sticker-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 148mm !important;
            height: 105mm !important;
          }
          
          @page {
            size: A6;
            margin: 5mm;
          }
        }
        `,
        }}
      />
    </div>
  );
}
