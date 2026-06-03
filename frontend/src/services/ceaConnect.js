export const capturarFirmaWacom =
  async () => {
    try {
      const response =
        await fetch(
          "http://localhost:3005/firma"
        );

      const data =
        await response.json();

      return data;

    } catch (error) {
      console.error(error);

      return {
        ok: false,
      };
    }
  };