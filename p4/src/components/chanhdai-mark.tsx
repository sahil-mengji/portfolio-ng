export function ChanhDaiMark(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 226 153"
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M226 153H116V0H226V153ZM131 18V97H150V37H161V97H180V37H191V97H210V18H131Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M110 153H0V0H110V153ZM17 18V67H74V78H17V97H93V48H36V37H93V18H17Z"
      />
    </svg>
  )
}

export function getMarkSVG(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 226 153"><path fill="${color}" fill-rule="evenodd" clip-rule="evenodd" d="M226 153H116V0H226V153ZM131 18V97H150V37H161V97H180V37H191V97H210V18H131Z" /><path fill="${color}" fill-rule="evenodd" clip-rule="evenodd" d="M110 153H0V0H110V153ZM17 18V67H74V78H17V97H93V48H36V37H93V18H17Z" /></svg>`
}
