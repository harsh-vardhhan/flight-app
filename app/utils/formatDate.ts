
export const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  