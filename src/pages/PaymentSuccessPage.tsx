import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, orderStatus } = location.state || {};

  React.useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
    }
  }, [orderId, navigate]);

  const isGift = orderStatus === 'pending';

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 pb-6 px-4 bg-white flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-poppins font-bold text-green-600">
              ¡Pago Completado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg">
              Tu pedido ha sido procesado con éxito.
            </p>
            
            {orderId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Número de pedido:</p>
                <p className="font-mono text-sm break-all">{orderId}</p>
              </div>
            )}

            <div className="space-y-2">
              {isGift ? (
                <p className="text-gray-700">
                  Los destinatarios recibirán un email con la notificación del regalo y 
                  las instrucciones para completar sus datos de envío.
                </p>
              ) : (
                <p className="text-gray-700">
                  Recibirás un email de confirmación con los detalles de tu pedido.
                </p>
              )}
              <p className="text-gray-700">
                Te hemos enviado un email de confirmación con todos los detalles.
              </p>
            </div>

            <Button
              onClick={() => navigate('/')}
              className="bg-gold hover:bg-gold/90 text-black font-bold"
            >
              Volver a la página principal
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
