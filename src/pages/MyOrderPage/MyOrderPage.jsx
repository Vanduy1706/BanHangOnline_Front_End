import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import * as OrderService from '../../services/OrderService'
import Loading from '../../components/LoadingComponent/Loading'
import { useLocation, useNavigate } from 'react-router-dom'
import { WrapperContainer, WrapperFooterItem, WrapperHeaderItem, WrapperItemOrder, WrapperListOrder, WrapperStatus } from './style'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import { convertPice } from '../../utils'
import { useMutationhooks } from '../../hooks/useMutationHooks'
import { message } from 'antd'
import { useSelector } from 'react-redux'

export const MyOrderPage = () => {
  const user = useSelector((state) => state?.user)
  const location = useLocation()
  const { state } = location
  const navigate = useNavigate()
  const[orders, setOrders] = useState([]);
  const fetchMyOrder = async () => {
    try {
      const res = await OrderService.getOrderByUserId(state?.id, state?.token);
      return setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  const queryOrder = useQuery({ queryKey: ['orders'],queryFn : fetchMyOrder, refetchOnWindowFocus: false }, {
    enabled: state?.id && state?.token
  })

  const { isLoading, refetch } = queryOrder

  const handleDetailsOrder = (id) => {
    navigate(`/details-order/${id}`, {
      state: {
        token:state?.token
      }
    })
  }

  const mutation = useMutationhooks(
    (orders) => {
      const { id, token, orderItems } = orders
      const res = OrderService.cancelOrder(id, token, orderItems)
      return res
    }
  )

  const handleCancelOrder = (order) => {
    mutation.mutate({id: order._id, token:state?.token, orderItems: order?.orderItems}, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  const { isLoading: isLoadingCancel, isSuccess: isSuccessCancel, isError: isErrorCancel, data: dataCancel } = mutation

  useEffect(() => {
    if(isSuccessCancel && dataCancel?.status === 'OK' ) {
      message.success('Bạn đã hủy đơn hàng thành công')
    }else if(isErrorCancel) {
      message.error()
    }
  }, [isErrorCancel, isSuccessCancel])

  const renderProduct = (orders) => {
   return orders?.map((order) => {
      return (
        <WrapperHeaderItem key={order?._id}>
            <img src={order?.image} 
            style={{
            width: '70px', 
            height:'70px', 
            objectFit:'cover',
            border: '1px solid rgb(238, 238, 238)',
            padding: '2px'
            }} 
            alt='Hình ảnh'
        />
        <div style={{
          width:'260px',
          overflow:'hidden',
          textOverflow:'ellipsis',
          whiteSpace:'nowrap'
          }}>{order?.name}</div>
          <span style={{fontSize:'13px', color:'#242424', marginLeft:'auto'}}>{convertPice(order?.price)}</span>
        </WrapperHeaderItem>
      )
    })
  };


  return (
    <>
      {user?.access_token ? (
        <Loading isLoading={isLoading || isLoadingCancel}>
          <WrapperContainer>
            <div style={{height:'100%',width:'1270px', margin:'0 auto'}}>
              <h4>Đơn hàng của tôi</h4>
              <WrapperListOrder>
              {orders?.map((order) => {
                  return (
                    <WrapperItemOrder key={order?._id}>
                      <WrapperStatus>
                        <span style={{fontSize: '14px', fontWeight: ' bold'}}>Trạng Thái</span>
                        <div><span style={{color:'rgb(255, 66, 78)'}}>Giao hàng: </span>{`${order.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng'}`}</div>
                        <div><span style={{color:'rgb(255, 66, 78)'}}>Thanh toán: </span>{`${order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}`}</div>
                      </WrapperStatus>
                      {renderProduct(order?.orderItems)}
                      <WrapperFooterItem>
                        <div>
                          <span style={{color:'rgb(255, 66, 78)'}}>Tổng tiền: </span>
                          <span style={{fontSize:'13px', color:'rgb(56, 56, 61)',fontWeight: 700}}>{convertPice(order?.totalPrice)}</span>
                        </div>
                        <div style={{display:'flex', gap:'10px'}}>
                          {!order.isDelivered && !order.isPaid ? (
                            <ButtonComponent
                                  onClick={() => handleCancelOrder(order)}
                                  size={40}
                                  styleButton={{
                                    height:'36px',
                                    border: '1px solid rgb(11, 116, 229)',
                                    borderRadius:'4px'
                                  }}
                                  textbutton={'Hủy đơn hàng'}
                                  styletextbutton={{color:'rgb(11, 116, 229)', fontSize:'14px'}}
                                >
                                </ButtonComponent>
                          ) : (
                            <React.Fragment>
                              {order.isDelivered && order.isPaid ? (
                                <ButtonComponent
                                // onClick={() => handleCancelOrder(order)}
                                size={40}
                                styleButton={{
                                  height:'36px',
                                  border: '1px solid rgb(11, 116, 229)',
                                  borderRadius:'4px',
                                  background: '#0b74e5'             
                                }}
                                textbutton={'Mua lại'}
                                styletextbutton={{color:'#eee', fontSize:'14px'}}
                                >
                                </ButtonComponent>
                              ) : null}
                            </React.Fragment>
                          )}
                          <ButtonComponent
                            onClick={() => handleDetailsOrder(order?._id)}
                            size={40}
                            styleButton={{
                              height:'36px',
                              border: '1px solid rgb(11, 116, 229)',
                              borderRadius:'4px'
                            }}
                            textbutton={'Xem chi tiết'}
                            styletextbutton={{color:'rgb(11, 116, 229)', fontSize:'14px'}}
                          >
                          </ButtonComponent>
                        </div>
                      </WrapperFooterItem>
                    </WrapperItemOrder>
                  )
                })}
              </WrapperListOrder>
            </div>
          </WrapperContainer>
        </Loading>
      ) : null}
    </>
  )
}

export default MyOrderPage
