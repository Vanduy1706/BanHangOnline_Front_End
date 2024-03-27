import React, {useState, useEffect} from 'react'
import { WrapperHeader } from './style'
import { Button, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import TableComponent from '../TableComponent/TableComponent'
import InputComponent from '../InputComponent/InputComponent'
import { convertPice } from '../../utils'
import { useSelector } from 'react-redux'
import * as OrderService from '../../services/OrderService'
import { useQuery } from '@tanstack/react-query'
import { orderContant } from '../../contant'
import PiChart from './PiChart'
import { EditOutlined } from '@ant-design/icons'
import DrawerComponent from '../DrawerComponent/DrawerComponent'
import Loading from '../../components/LoadingComponent/Loading'
import {Form } from 'antd'
import { useMutationhooks } from '../../hooks/useMutationHooks'
import MessageService from '../../components/Message/message'


const OrderAdmin = () => {
  const message = MessageService.getInstance()
  
  const user = useSelector((state) => state?.user)
  const [isOpenDrawer, setIsOpenDrawer] = useState(false)
  const [rowSelected, setRowSelected] = useState('')
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [form] = Form.useForm();
  const initial = () => ({
    isDelivered: '',
    isPaid: '',
  })

  const [stateOrderDetails, setStateOrderDetails] = useState(initial())

  const getAllOrder = async () => { 
    const res = await OrderService.getAllOrder(user?.access_token)
    return res
  }

  const queryOrder = useQuery({ queryKey: ['orders'],queryFn : getAllOrder })
  const { isLoading : isLoadingOrders, data : orders } = queryOrder

  const handleDetailsProduct = async () => {
    setIsOpenDrawer(true)
  }
  
  const handleCloseDrawer = () => {
    setIsOpenDrawer(false);
    setStateOrderDetails({
      isDelivered: '',
      isPaid: ''
    })
    form.resetFields()
  }
  const renderAction = () => {
    return (
      <div>
        <EditOutlined style={{color:'blue', fontSize:'30px', cursor:'pointer'}} onClick={handleDetailsProduct} />
      </div>
    )
  }

  const mutationUpdate = useMutationhooks(
    (data) => {
        const { 
          id, 
          token, 
         ...rests } = data
       const res = OrderService.updateOrder(
          id, 
          token, 
          { ...rests })
        return res;
    },
  )

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
      }
    },
  });
  
  const columns = [
    {
      title: 'User name',
      dataIndex: 'userName',
      sorter: (a, b) => a.userName.length - b.userName.length,
      ...getColumnSearchProps('userName')
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: (a, b) => a.phone.length - b.phone.length,
      ...getColumnSearchProps('phone')
    },
    {
      title: 'Address',
      dataIndex: 'address',
      sorter: (a, b) => a.address.length - b.address.length,
      ...getColumnSearchProps('address')
    },
    {
      title: 'IsDelivered',
      dataIndex: 'isDelivered',
      sorter: (a, b) => a.isDelivered.length - b.isDelivered.length,
      ...getColumnSearchProps('isisDeliveredPaid')
    },
    {
      title: 'Paided',
      dataIndex: 'isPaid',
      sorter: (a, b) => a.isPaid.length - b.isPaid.length,
      ...getColumnSearchProps('isPaid')
    },
    {
      title: 'PaymentMethod',
      dataIndex: 'paymentMethod',
      sorter: (a, b) => a.paymentMethod.length - b.paymentMethod.length,
      ...getColumnSearchProps('paymentMethod')
    },
    {
      title: 'Total price',
      dataIndex: 'totalPrice',
      sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
      ...getColumnSearchProps('totalPrice')
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: renderAction
    },
  ];
  const dataTable = orders?.data?.length && orders?.data?.map((order) => {
    console.log('order', order)
    return {...order, key: order._id, userName: order?.shippingAddress?.fullName, phone: order?.shippingAddress?.phone, address: 
      order?.shippingAddress?.address, paymentMethod: orderContant.payment[order?.paymentMethod], isPaid: order?.isPaid ? 'TRUE' : 'FALSE', 
      isDelivered: order.isDelivered ? 'TRUE' : 'FALSE', totalPrice: convertPice(order?.totalPrice) }
  })
  const { data: dataUpdated, isLoading: isLoadingUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated } = mutationUpdate


  const fetchGetDetailsOrder = async (rowSelected) => {
    const res = await OrderService.getDetailsOrderAdmin(rowSelected)
    console.log(res)
    if(res?.data) {
      setStateOrderDetails({
        isDelivered: res?.data?.isDelivered,
        isPaid: res?.data?.isPaid
      })
    }
    setIsLoadingUpdate(false)
  }

  const onUpdateProduct = () => {
    mutationUpdate.mutate({ id: rowSelected, token: user?.access_token, ...stateOrderDetails}, {
      onSettled: () => {
        queryOrder.refetch()
      }
    })
  }

  useEffect(() => {
    if(rowSelected && isOpenDrawer){
      setIsLoadingUpdate(true)
      fetchGetDetailsOrder(rowSelected)
    }
  }, [rowSelected, isOpenDrawer])

  const handleOnchange = (e) => {
    setStateOrderDetails({
      ...stateOrderDetails,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    if(!isOpenDrawer) {
      form.setFieldsValue(initial())
    } else {
      form.setFieldsValue(stateOrderDetails)
    }
  }, [form, stateOrderDetails, isOpenDrawer])

  useEffect(() => {
    if(isSuccessUpdated && dataUpdated?.status === 'OK'){
      message.success()
      handleCloseDrawer()
    }else if (isErrorUpdated){
      message.error()
    }
  }, [isSuccessUpdated])
  return (
    <div>
      <WrapperHeader>Quản lý đơn hàng</WrapperHeader>
      <div style={{height:'180px',width:'500px'}}>
      <PiChart data={orders?.data}/>
      </div>
      <div style={{marginTop:'20px'}}>
            <TableComponent  columns={columns} isLoading={isLoadingOrders} data={dataTable} onRow={(record, rowIndex) => {
              return {
              onClick: event => {
                setRowSelected(record._id)
              } 
            };
          }}/>    
      </div>
      <DrawerComponent title='Cập nhật trạng thái' isOpen={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} width='90%'>
        <Loading isLoading={isLoadingUpdate || isLoadingUpdated}>
        <Form
          name="basic"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
          onFinish={onUpdateProduct}
          autoComplete="on"
          form={form}
        >
          <Form.Item
            label="isDelivered"
            name="isDelivered"
            rules={[{ required: true, message: 'Please input your isDelivered!' }]}
          >
            <InputComponent  value={stateOrderDetails['isDelivered']} onChange={handleOnchange} name="isDelivered"/>
          </Form.Item>
          <Form.Item
            label="IsPaid"
            name="isPaid"
            rules={[{ required: true, message: 'Please input your isPaid!' }]}
          >
            <InputComponent  value={stateOrderDetails.isPaid} onChange={handleOnchange} name="isPaid"/>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 20, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Apply
            </Button>
          </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>
    </div>
  )
}

export default OrderAdmin
