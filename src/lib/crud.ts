import { getSupabase } from "./supabaseClient";


// CRUD - CREATE
export async function createProduct(product: unknown) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();


        if (error) {
            console.log("Create failed: ", error);
            throw new Error("Kunne ikke oprette produktet");
        }

        return data;
}


// CRUD - READ
export async function getProduct() {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("products")
        .select();

        if (error) {
            console.log("Read failed: ", error);
            throw new Error("Kunne ikke hente produkter");
        }

        return data;
}



// CRUD - UPDATE
export async function updateProduct(id: string, updates: unknown) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

        if (error) {
            console.log("Update failed: ", error);
            throw new Error("Kunne ikke updatere produkter");
        }

        return data;
}




// CRUD - DELETE
export async function deleteProduct(id: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

        if (error) {
            console.log("Delete failed: ", error);
            throw new Error("Kunne ikke slette produkter");
        }

        return data;
}


