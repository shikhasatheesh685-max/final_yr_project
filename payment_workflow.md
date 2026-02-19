# Payment Workflow Documentation

## Art Gallery Showcase System

------------------------------------------------------------------------

## 1. Overview

This project does not use a real payment gateway (such as Stripe or
PayPal). Instead, it simulates payment processing using an Order-based
workflow. Orders represent completed financial transactions logically
within the system.

The platform follows a commission-based revenue model:

-   100% of the payment is logically received by Admin.
-   Admin keeps 7% commission.
-   93% is allocated to the Artist.
-   Once an order is marked as "Sold", it is considered final and
    non-refundable.

------------------------------------------------------------------------

## 2. Existing Payment Workflow

### 2.1 Direct Artwork Purchase

1.  Visitor clicks "Purchase" on artwork detail page.
2.  Frontend sends POST request to `/api/orders`.
3.  Backend validates:
    -   Artwork exists
    -   Artwork is available
    -   Buyer is not the artist
4.  Order is created with:
    -   totalAmount = artwork.price
    -   commissionAmount = totalAmount \* COMMISSION_RATE (previously
        10%)
    -   orderStatus = "Pending"
5.  Artwork `isAvailable` is set to false.
6.  Admin updates order status:
    -   Pending → Confirmed → Sold
7.  Reports count only orders where orderStatus = "Sold".

Note: No real payment processing occurs.

------------------------------------------------------------------------

### 2.2 Auction Purchase

1.  Admin finalizes auction.
2.  Highest bid is selected as winner.
3.  Artwork is marked unavailable.
4.  Order is created with:
    -   userID = winner
    -   totalAmount = winning bid
    -   orderStatus = "Sold"

Commission calculation was inconsistent in auction flow.

------------------------------------------------------------------------

## 3. New Payment Workflow (To Be Implemented)

The system will remain simulation-based (no external payment gateway).
However, commission logic and payout tracking will be properly
structured.

### Commission Rule

-   COMMISSION_RATE = 0.07 (7%)
-   Admin receives 7%
-   Artist receives 93%
-   No refund after order is marked "Sold"

------------------------------------------------------------------------

## 4. Required Schema Updates

Update Order Schema to include:

-   adminCommission (Number)
-   artistAmount (Number)
-   paymentType (String: "Artwork" or "Auction")
-   payoutStatus (String: "Pending", "Transferred")
-   Default payoutStatus = "Pending"

------------------------------------------------------------------------

## 5. Updated Direct Purchase Flow

When creating order:

-   totalAmount = artwork.price
-   adminCommission = totalAmount \* 0.07
-   artistAmount = totalAmount - adminCommission
-   orderStatus = "Pending"
-   payoutStatus = "Pending"
-   paymentType = "Artwork"

Admin updates: - Pending → Confirmed - Confirmed → Sold

Once status becomes "Sold": - Transaction is considered completed. -
Commission and payout values are fixed. - Order cannot be reverted.

------------------------------------------------------------------------

## 6. Updated Auction Flow

When auction is finalized:

-   totalAmount = winningBid
-   adminCommission = winningBid \* 0.07
-   artistAmount = winningBid - adminCommission
-   orderStatus = "Sold"
-   payoutStatus = "Pending"
-   paymentType = "Auction"

Auction and direct purchase must follow identical commission logic.

------------------------------------------------------------------------

## 7. Admin Payout Process

Create Admin-only route:

PUT /api/orders/:id/transfer

Logic: - Allow only if orderStatus == "Sold" - Change payoutStatus from
"Pending" → "Transferred"

This simulates admin transferring 93% to artist.

------------------------------------------------------------------------

## 8. Reporting Logic

Admin Sales Report must calculate:

-   totalRevenue = sum(totalAmount where orderStatus == "Sold")
-   totalCommission = sum(adminCommission where orderStatus == "Sold")
-   totalArtistPayout = sum(artistAmount where orderStatus == "Sold")

------------------------------------------------------------------------

## 9. Refund Policy

Once orderStatus = "Sold": - Transaction is final. - No refund or
reversal supported. - No refund route should be implemented.

------------------------------------------------------------------------

## 10. Final Logical Flow Summary

### Direct Purchase

Visitor → Order Created (Pending) → Admin Confirm → Admin Mark Sold →
Commission Calculated → Payout Pending → Admin Transfer → PayoutStatus =
Transferred

### Auction

Auction Finalized → Winner Selected → Order Created (Sold) → Commission
Calculated → Payout Pending → Admin Transfer

------------------------------------------------------------------------

End of Document
