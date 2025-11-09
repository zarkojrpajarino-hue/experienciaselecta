import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePendingReviews = (userId: string | undefined) => {
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  const checkPendingReviews = useCallback(async () => {
    if (!userId) {
      setPendingReviewsCount(0);
      return;
    }

    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!customerData) {
        setPendingReviewsCount(0);
        return;
      }

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
        .lt('created_at', tenDaysAgo.toISOString());

      if (!ordersData || ordersData.length === 0) {
        setPendingReviewsCount(0);
        return;
      }

      const orderIds = ordersData.map(o => o.id);
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('user_id', userId);

      const reviewedOrderIds = new Set(reviewsData?.map(r => r.order_id) || []);
      const pendingCount = ordersData.filter(o => !reviewedOrderIds.has(o.id)).length;
      
      setPendingReviewsCount(pendingCount);

      // Verificar si hay recordatorios de email enviados recientemente (últimas 72h)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: remindersData } = await supabase
        .from('review_reminders')
        .select('order_id, last_sent_at')
        .eq('customer_id', customerData.id)
        .gte('last_sent_at', threeDaysAgo.toISOString());

      // Si hay recordatorios enviados recientemente para órdenes sin review, activar badge
      if (remindersData && remindersData.length > 0) {
        const hasRecentReminders = remindersData.some(
          r => !reviewedOrderIds.has(r.order_id)
        );
        
        if (hasRecentReminders) {
          console.log('📧 Recordatorios de email detectados - activando badge de feedback');
          sessionStorage.setItem('emailReminderPending', 'true');
          window.dispatchEvent(new CustomEvent('pendingFeedbackChanged'));
        }
      }
    } catch (error) {
      console.error('Error checking pending reviews:', error);
    }
  }, [userId]);

  useEffect(() => {
    checkPendingReviews();
  }, [checkPendingReviews]);

  return { pendingReviewsCount, refreshPendingReviews: checkPendingReviews };
};
