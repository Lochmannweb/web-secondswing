"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Alert, TextField } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { getProfile, updateProfile as updateProfileApi } from "@/app/lib/profilesApi";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { uploadImageFile } from "@/app/lib/uploadImage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "../../profil.css";

export default function Profiloplysninger() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Danmark");
  const [bio, setBio] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/placeholderprofile.jpg");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = getSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      setEmail(user.email ?? "");
      setOriginalEmail(user.email ?? "");
      setPhone((user.user_metadata?.phone as string) ?? "");
      setLocation((user.user_metadata?.location as string) ?? "");
      setShippingStreet((user.user_metadata?.shipping_street as string) ?? "");
      setShippingPostalCode((user.user_metadata?.shipping_postal_code as string) ?? "");
      setShippingCity((user.user_metadata?.shipping_city as string) ?? "");
      setShippingCountry((user.user_metadata?.shipping_country as string) || "Danmark");
      setBio((user.user_metadata?.bio as string) ?? "");

      try {
        const data = await getProfile(user.id);
        if (data.avatar_url) setImagePreview(data.avatar_url);
        if (data.display_name) setDisplayName(data.display_name);
      } catch {
        // Profil oprettes ved første gem
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview((e.target?.result as string) || "/placeholderprofile.jpg");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Du skal være logget ind");

      let newAvatarUrl = imagePreview;
      if (imageFile) newAvatarUrl = await uploadImageFile(imageFile);

      await updateProfileApi(user.id, {
        avatar_url: newAvatarUrl,
        display_name: displayName.trim(),
      });

      const authUpdates: { email?: string; data?: Record<string, string> } = {};

      if (email.trim() && email.trim() !== originalEmail) {
        authUpdates.email = email.trim();
      }

      authUpdates.data = {
        ...user.user_metadata,
        phone: phone.trim(),
        location: location.trim(),
        shipping_full_name: displayName.trim(),
        shipping_street: shippingStreet.trim(),
        shipping_postal_code: shippingPostalCode.trim(),
        shipping_city: shippingCity.trim(),
        shipping_country: shippingCountry.trim(),
        bio: bio.trim(),
        display_name: displayName.trim(),
      };

      const { error: authUpdateError } = await supabase.auth.updateUser(authUpdates);
      if (authUpdateError) throw new Error(authUpdateError.message);

      setImagePreview(newAvatarUrl);
      setImageFile(null);
      setOriginalEmail(email.trim());
      setMessage({ type: "success", text: "Profil opdateret" });
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Der opstod en fejl";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  function upgradeGoogleAvatar(url: string) {
    return url.replace(/=s\d+-c$/, "=s512-c");
  }

  return (
    <Box className="profil-layout">
      <Box className="profil-image-column">
        <Box className="profil-image-stage">
          <Image
            src={upgradeGoogleAvatar(imagePreview)}
            alt="Profil preview"
            fill
            className="profil-image"
            priority
          />
        </Box>
        <Button variant="outlined" component="label" fullWidth className="profil-upload-button">
          Vælg nyt billede
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>
      </Box>

      <Box className="profil-fields">
        <Button
          onClick={() => router.push("/indstillinger")}
          className="profil-back"
          startIcon={<NavigateBeforeIcon />}
        >
          Tilbage
        </Button>

        <Box className="profil-form-header">
          <p className="profil-form-kicker">Indstillinger</p>
          <h1 className="profil-form-title">Profil & adresse</h1>
        </Box>

        <p className="profil-section-label">Personligt</p>

        <TextField
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          className="profil-field"
          label="Navn"
          margin="dense"
        />
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          className="profil-field"
          label="Email"
          type="email"
          margin="dense"
        />
        <TextField
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          className="profil-field"
          label="Telefon"
          margin="dense"
        />
        <TextField
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          className="profil-field"
          label="Lokation"
          margin="dense"
        />
        <TextField
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          className="profil-field"
          label="Om mig"
          margin="dense"
          multiline
          minRows={3}
        />

        <p className="profil-section-label">Leveringsadresse</p>

        <TextField
          value={shippingStreet}
          onChange={(e) => setShippingStreet(e.target.value)}
          fullWidth
          className="profil-field"
          label="Gade og husnummer"
          margin="dense"
        />
        <TextField
          value={shippingPostalCode}
          onChange={(e) => setShippingPostalCode(e.target.value)}
          fullWidth
          className="profil-field"
          label="Postnummer"
          margin="dense"
        />
        <TextField
          value={shippingCity}
          onChange={(e) => setShippingCity(e.target.value)}
          fullWidth
          className="profil-field"
          label="By"
          margin="dense"
        />
        <TextField
          value={shippingCountry}
          onChange={(e) => setShippingCountry(e.target.value)}
          fullWidth
          className="profil-field"
          label="Land"
          margin="dense"
        />

        <Button
          variant="contained"
          fullWidth
          className="profil-save-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Gemmer..." : "Gem ændringer"}
        </Button>

        {message ? (
          <Alert severity={message.type} className="profil-alert">
            {message.text}
          </Alert>
        ) : null}
      </Box>
    </Box>
  );
}
