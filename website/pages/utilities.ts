export async function send(route: string, data: any) {
  const response = await fetch(`https://finalproject-aors.onrender.com/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json();
}
