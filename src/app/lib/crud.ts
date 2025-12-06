import { getSupabaseClient } from "./supabaseClient";

const supabase = getSupabaseClient();

// CRUD - CREATE + error handling i backend
export async function createProduct(product: unknown) {

    const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

        if (error) {
            console.error("-- SUPABASE INSERT ERROR --")
            console.error("Message:", error.message)
            console.error("Details:", error.details)
            console.error("Hint:", error.hint)
            console.error("Code:", error.code)
            throw new Error(error.message) 
        }

        return data;
}


// CRUD - READ + error handling i backend
export async function getProduct() {
    const { data, error } = await supabase
        .from("products")
        .select();

        if (error) {
            console.log("Read failed: ", error);
            throw new Error("Kunne ikke hente produkter");
        }

        return data;
}



// CRUD - UPDATE + error handling i backend
export async function updateProduct(id: string, updates: unknown) {
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




// CRUD - DELETE + error handling i backend
export async function deleteProduct(id: string) {
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


