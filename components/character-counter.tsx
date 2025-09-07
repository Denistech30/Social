interface CharacterCounterProps {
  count: number
}

export function CharacterCounter({ count }: CharacterCounterProps) {
  return <div className="text-right text-xs text-muted-foreground">{count.toLocaleString()} characters</div>
}
