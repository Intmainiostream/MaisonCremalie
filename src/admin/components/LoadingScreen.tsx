import Mascot from '../../components/illustrations/Mascot'

function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="admin-loading" role="status">
      <Mascot className="admin-loading-mascot" />
      <p>{label}</p>
    </div>
  )
}

export default LoadingScreen
