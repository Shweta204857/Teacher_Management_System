import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Caught by ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0f', padding:20 }}>
          <div style={{ background:'#16161f', border:'1px solid rgba(239,68,68,0.3)', borderRadius:20, padding:'40px 36px', maxWidth:480, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
            <div style={{ fontWeight:800, fontSize:18, color:'#f0f0ff', marginBottom:8 }}>Something went wrong</div>
            <div style={{ fontSize:13, color:'#8888aa', marginBottom:24, lineHeight:1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </div>
            <button
              onClick={() => { this.setState({ hasError:false, error:null }); window.location.reload(); }}
              style={{ padding:'10px 28px', borderRadius:10, border:'none', background:'#6c63ff', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
