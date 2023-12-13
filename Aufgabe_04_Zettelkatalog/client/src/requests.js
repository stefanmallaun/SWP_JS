import axios from "axios";

export async function api_search(q) {
  try {
    const response = await axios.get(
      `http://localhost:5000/cat-search/${q}`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
export async function api_search_history(c) {
  try {
    const response = await axios.get(
      `http://localhost:5000/history-item/${c.id}`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
export async function api_patch(c) {
  try {
    const response = await axios.patch(
      `http://localhost:5000/cat-item/${c.id}`,
      {
        params: {
          description: c.description,
        },
      }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }

  try {
    const response = await axios.put(
      `http://localhost:5000/history-item/${c.id}`,
      {
        params: {
          card_id: c.id,
          description: c.description,
        },
      }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}
