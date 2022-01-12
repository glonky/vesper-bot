import pluralize from 'pluralize';

export function formatTimeFromSeconds(seconds: number | string) {
  const secondsAsNumber = Number(seconds);
  const hours = Math.floor(secondsAsNumber / 3600);
  const minutes = Math.floor((secondsAsNumber % 3600) / 60);
  const secondsLeft = Math.floor(secondsAsNumber % 60);

  let formattedTime = '';
  if (hours > 0) {
    formattedTime += `${hours} ${pluralize('hour', hours)} `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes} ${pluralize('min', minutes)} `;
  }
  if (secondsLeft > 0) {
    formattedTime += `${secondsLeft} ${pluralize('sec', secondsLeft)}`;
  }

  return formattedTime;
}
