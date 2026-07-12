"use client";

import {
  CUSTOM_OFFER_ID,
  getOfferPresets,
  parseCustomOfferAmount,
  validateCustomOfferAmount,
} from "@/app/lib/offerPresets";
import { findOrCreateChat, sendMessage } from "@/app/lib/chatsApi";
import { Box, Button, Drawer, TextField } from "@mui/material";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import "./offerBidDrawer.css";

interface OfferBidDrawerProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    user_id: string;
  };
  viewerId: string | null;
  onLoginRequired: () => void;
  onError: (message: string) => void;
}

export default function OfferBidDrawer({
  open,
  onClose,
  product,
  viewerId,
  onLoginRequired,
  onError,
}: OfferBidDrawerProps) {
  const offerPresets = useMemo(() => getOfferPresets(product.price), [product.price]);
  const [selectedOfferId, setSelectedOfferId] = useState(offerPresets[1]?.id ?? "");
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedOfferId(offerPresets[1]?.id ?? offerPresets[0]?.id ?? "");
    setCustomAmountInput("");
    setCustomAmountError(null);
  }, [open, offerPresets]);

  const isCustomOffer = selectedOfferId === CUSTOM_OFFER_ID;

  const selectedPreset = offerPresets.find((preset) => preset.id === selectedOfferId);
  const customAmount = isCustomOffer ? parseCustomOfferAmount(customAmountInput) : null;
  const selectedAmount = isCustomOffer ? customAmount : selectedPreset?.amount;

  const selectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    setCustomAmountError(null);
  };

  const submitOffer = async () => {
    if (!viewerId) {
      onLoginRequired();
      return;
    }

    if (isCustomOffer) {
      if (customAmount == null) {
        setCustomAmountError("Indtast et gyldigt beløb");
        return;
      }

      const validationError = validateCustomOfferAmount(customAmount, product.price);
      if (validationError) {
        setCustomAmountError(validationError);
        return;
      }
    }

    if (!selectedAmount) {
      onError("Vælg et bud");
      return;
    }

    setIsSubmitting(true);
    setCustomAmountError(null);

    try {
      const chat = await findOrCreateChat(viewerId, product.user_id);
      const offerMessage = `Bud: ${selectedAmount} kr på "${product.title}" (annonceret pris: ${product.price} kr)`;

      await sendMessage({
        chatId: chat.id,
        senderId: viewerId,
        receiverId: product.user_id,
        content: offerMessage,
      });

      onClose();
      window.location.href = `/chats?chatId=${chat.id}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke sende bud";
      onError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      className="offer-bid-drawer"
      PaperProps={{ className: "offer-bid-drawer-paper" }}
    >
      <Box className="offer-bid-drawer-inner">
        <span className="offer-bid-drawer-handle" aria-hidden />

        <Box className="offer-bid-drawer-top">
          <div>
            <p className="offer-bid-drawer-kicker">Giv bud</p>
            <h2 className="offer-bid-drawer-title">Vælg dit bud</h2>
          </div>
          <Button onClick={onClose} className="offer-bid-drawer-close">
            Luk
          </Button>
        </Box>

        <Box className="offer-bid-product">
          <Box className="offer-bid-product-image">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.title} fill style={{ objectFit: "cover" }} />
            ) : null}
          </Box>
          <div>
            <p className="offer-bid-product-name">{product.title}</p>
            <p className="offer-bid-product-price">Annonceret pris: {product.price} kr</p>
          </div>
        </Box>

        <p className="offer-bid-section-label">Dit bud</p>

        <Box className="offer-bid-options">
          {offerPresets.map((preset) => (
            <Button
              key={preset.id}
              onClick={() => selectOffer(preset.id)}
              className={`offer-bid-option${selectedOfferId === preset.id ? " is-selected" : ""}`}
            >
              <span className="offer-bid-option-amount">{preset.label}</span>
              <span className="offer-bid-option-meta">-{preset.discountPercent}%</span>
            </Button>
          ))}

          <Button
            onClick={() => selectOffer(CUSTOM_OFFER_ID)}
            className={`offer-bid-option offer-bid-option--custom${
              isCustomOffer ? " is-selected" : ""
            }`}
          >
            <span className="offer-bid-option-amount">Eget beløb</span>
            <span className="offer-bid-option-meta">Indtast selv</span>
          </Button>
        </Box>

        {isCustomOffer ? (
          <TextField
            className="offer-bid-custom-field"
            label="Dit bud (kr)"
            value={customAmountInput}
            onChange={(e) => {
              setCustomAmountInput(e.target.value);
              setCustomAmountError(null);
            }}
            fullWidth
            margin="dense"
            inputMode="numeric"
            error={Boolean(customAmountError)}
            helperText={customAmountError ?? `Skal være under ${product.price} kr`}
          />
        ) : null}

        <p className="offer-bid-hint">
          Sælgeren modtager dit bud i chatten og kan acceptere eller afvise det.
        </p>

        <Button
          variant="contained"
          onClick={submitOffer}
          className="offer-bid-submit"
          disabled={!selectedAmount || isSubmitting}
        >
          {isSubmitting
            ? "Sender bud..."
            : `Send bud på ${isCustomOffer ? customAmount ?? 0 : selectedPreset?.amount ?? 0} kr`}
        </Button>
      </Box>
    </Drawer>
  );
}
